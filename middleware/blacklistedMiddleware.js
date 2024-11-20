const BlacklistedToken = require("../models/BlacklistedToken");

const checkBlacklist = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Check if the token exists in the blacklist
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    next();
  } catch (error) {
    console.error("Blacklist middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkBlacklist;
