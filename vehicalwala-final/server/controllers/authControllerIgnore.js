
const User = require("../models/User"); //  user model path
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); //  pass hashing 
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const loginUser = async (req, res) => {
  try {
    const { email, password, dashboardKey } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // owner check
    let isOwner = false;
    if (email.toLowerCase() === (process.env.OWNER_EMAIL || "").toLowerCase()) {
      // if user is owner then dashboardKey MUST be provided and match
      if (!dashboardKey) {
        return res.status(401).json({ success: false, message: "Owner dashboard key required" });
      }
      if (dashboardKey !== process.env.OWNER_DASHBOARD_KEY) {
        return res.status(401).json({ success: false, message: "Invalid owner dashboard key" });
      }
      isOwner = true;
    }

    const payload = {
      id: user._id,
      email: user.email,
      isOwner,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // send back minimal user info and token
    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isOwner,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = { loginUser };
