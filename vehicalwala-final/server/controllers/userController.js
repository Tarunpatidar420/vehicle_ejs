const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Car = require("../models/Car");


   // Generate JWT Token
  

const generateToken = (user, isOwner = false) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      isOwner, 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


   // REGISTER USER

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (!email.includes("@")) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (
      password.length < 8 ||
      password.length > 16 ||
      !/^[A-Z]/.test(password) ||
      !/[@#$]/.test(password)
    ) {
      return res.json({
        success: false,
        message:
          "Password must be 8–16 chars, start with capital & contain @ # or $",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user, false);

    return res.json({
      success: true,
      token,
      message: "Account created successfully",
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};


   // LOGIN USER 

const loginUser = async (req, res) => {
  try {
    const { email, password, dashboardKey } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

   
       // OWNER CHECK
    
    let isOwner = false;

    if (email === process.env.OWNER_EMAIL) {
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

    //  TOKEN WITH OWNER 
    const token = generateToken(user, isOwner);

    return res.json({
      success: true,
      token,
      isOwner,
      message: "Login successful",
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};


   // GET USER DATA

const getUserData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.json({
      success: true,
      user: req.user, //  contains isOwner now
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};


   // GET AVAILABLE CARS

const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true });
    return res.json({ success: true, cars });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};


module.exports = { registerUser, loginUser, getUserData, getCars };
