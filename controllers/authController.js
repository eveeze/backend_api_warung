// backend/controllers/authController.js
const User = require("../models/User");
const { generateOTP, sendWhatsAppOTP } = require("../utils/fonnte");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { phone, name, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ phone });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP expires in 5 minutes

    // Create or update user
    if (!user) {
      user = new User({
        phone,
        name,
        password,
        otp: {
          code: otp,
          expiresAt: otpExpiry,
        },
      });
    } else {
      user.name = name;
      user.password = password;
      user.otp = {
        code: otp,
        expiresAt: otpExpiry,
      };
    }

    // Hash password before saving (handled by the User model pre-save hook)
    await user.save();

    // Send OTP via WhatsApp using Fonnte
    await sendWhatsAppOTP(phone, otp);

    res
      .status(200)
      .json({ message: "OTP sent successfully. Please verify OTP." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Other functions for verifyOTP and resendOTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Find the user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the OTP matches and is still valid
    if (user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.otp = undefined; // Clear the OTP once verified
    await user.save();

    // Return success message to redirect user to the login page in Flutter
    res
      .status(200)
      .json({ message: "User verified successfully. Please log in." });
  } catch (error) {
    console.error("Error in verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Find the user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // If the user is already verified, there's no need to resend the OTP
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate a new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // OTP expires in 5 minutes

    // Update the user's OTP
    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await user.save();

    // Send OTP via WhatsApp using Fonnte
    await sendWhatsAppOTP(phone, otp);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error in resending OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find the user by phone number
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if user is locked
    if (user.isLocked()) {
      const lockUntil = new Date(user.lockUntil);
      return res.status(403).json({
        message: `User is banned until ${lockUntil.toLocaleTimeString()}`,
      });
    }

    // Check if the entered password matches the stored hashed password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(403).json({
          message:
            "User is temporarily banned for 15 minutes due to multiple failed login attempts",
        });
      }

      await user.save();
      return res.status(401).json({ message: "Invalid password" });
    }

    // Reset failed attempts and store user data in the session
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    req.session.userId = user._id;
    req.session.isVerified = user.isVerified;

    res
      .status(200)
      .json({ message: "Logged in successfully", name: user.name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Server error during logout" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Server error" });
  }
};
