// /controllers/authController.js
const User = require("../models/User");
const { generateOTP, sendWhatsAppOTP } = require("../utils/fonnte");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedToken");
exports.register = async (req, res) => {
  try {
    const { phone, name, password } = req.body;

    let user = await User.findOne({ phone });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

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

    await user.save();

    await sendWhatsAppOTP(phone, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Error in verifying OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await user.save();

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

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isLocked()) {
      const lockUntil = new Date(user.lockUntil);
      return res.status(403).json({
        message: `User is banned until ${lockUntil.toLocaleTimeString()}`,
      });
    }

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

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await user.save();

    await sendWhatsAppOTP(phone, otp);

    res.status(200).json({
      message: "OTP sent for login verification",
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyLoginOTP = async (req, res) => {
  try {
    const { phone, password, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      isVerified: true,
      name: user.name,
    });
  } catch (error) {
    console.error("Login OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendLoginOTP = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await user.save();

    await sendWhatsAppOTP(phone, otp);

    res.status(200).json({ message: "Login OTP resent successfully" });
  } catch (error) {
    console.error("Error in resending login OTP:", error);
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
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const expiration = new Date(decoded.exp * 1000);

    const blacklistedToken = new BlacklistedToken({
      token,
      expiresAt: expiration,
    });
    await blacklistedToken.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.validateToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name phone");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Token is valid",
      user: {
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
