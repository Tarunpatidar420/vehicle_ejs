const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.json({ success: true, message: "Account created" });
  } catch (err) {
    res.json({ success: false, message: "Registration failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, dashboardKey } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    /* ===== OWNER CHECK ===== */
    let isOwner = false;

    if (
      email.toLowerCase() ===
      (process.env.OWNER_EMAIL || "").toLowerCase()
    ) {
      if (!dashboardKey) {
        return res.json({
          success: false,
          message: "Dashboard key required for owner",
        });
      }

      if (dashboardKey !== process.env.DASHBOARD_KEY) {
        return res.json({
          success: false,
          message: "Invalid dashboard key",
        });
      }

      isOwner = true;
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, isOwner },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      isOwner,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.json({ success: false, message: "Login failed" });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

  
    console.log("RESET LINK TOKEN:", resetToken);

    res.json({
      success: true,
      message: "Password reset link sent",
      token: resetToken, 
    });
  } catch (err) {
    res.json({ success: false, message: "Forgot password failed" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.json({ success: false, message: "Reset password failed" });
  }
});




module.exports = router;
