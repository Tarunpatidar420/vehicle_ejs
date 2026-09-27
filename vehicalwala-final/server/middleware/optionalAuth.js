
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const optionalProtect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      console.log("Optional auth failed:", error.message);
      req.user = null; 
    }
  } else {
    req.user = null; 
  }

  next();
};


module.exports = { optionalProtect };
