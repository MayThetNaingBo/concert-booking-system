const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 THIS IS THE LINE YOU ASKED ABOUT
    req.user = await User.findById(decoded.id).select("-password");

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
};