
const jwt = require("jsonwebtoken");
const User = require("../models/User");


  //  PROTECT

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    //  JWT is single source of truth
    req.user = {
      ...user._doc,
      isOwner: decoded.isOwner === true,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};


   // REQUIRE OWNER

const requireOwner = (req, res, next) => {
  if (!req.user || req.user.isOwner !== true) {
    return res.status(403).json({
      success: false,
      message: "Owner access only",
    });
  }
  next();
};


module.exports = { protect, requireOwner };
