const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["owner", "user"],
      default: "user",
    },

    image: { type: String, default: "" },

    //  Extra profile info
    whatsapp: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: String, default: "" },

    //  FORGOT / RESET PASSWORD 
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);






module.exports = User;
