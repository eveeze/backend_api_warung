// backend/middleware/authMiddleware.js
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authorized, no session" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, session failed" });
  }
};

module.exports = { protect };
