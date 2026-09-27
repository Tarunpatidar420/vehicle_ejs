
const express = require("express");
const { getCars,
  getUserData,
  loginUser,
  registerUser, } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const userRouter = express.Router();


   // AUTH ROUTES


// Register (normal user / owner both)
userRouter.post("/register", registerUser);

// Login 
userRouter.post("/login", loginUser);


   // PROTECTED ROUTES


// Get logged-in user data
userRouter.get("/data", protect, getUserData);


   


// Get all available vehicles 
userRouter.get("/cars", getCars);




module.exports = userRouter;
