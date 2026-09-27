const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ==========================================
    // BOOKED VEHICLE
    // ==========================================
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },

    // ==========================================
    // VEHICLE OWNER
    // ==========================================
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // REGISTERED USER
    // 
    // ==========================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // ==========================================
    // CUSTOMER DETAILS
    // ==========================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    whatsapp: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // VEHICLE USAGE
    // ==========================================
    vehicleUse: {
      type: String,
      required: true,
      trim: true,
    },

    otherUse: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // BOOKING DATES
    // ==========================================
    pickupDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    // ==========================================
    // QUANTITY
    // ==========================================
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==========================================
    // PRICE
    // ==========================================
    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // PAYMENT METHOD
    // ==========================================
    paymentMethod: {
      type: String,
      enum: ["offline", "googlepay", "paytm", "card"],
      default: "offline",
    },

    // ==========================================
    // BOOKING STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // ==========================================
    // WHO CANCELLED THE BOOKING
    // ==========================================
    cancelledBy: {
      type: String,
      enum: ["user", "owner", null],
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

bookingSchema.index({
  car: 1,
  pickupDate: 1,
  returnDate: 1,
});

bookingSchema.index({
  owner: 1,
});

bookingSchema.index({
  user: 1,
});

// ==========================================
// MODEL
// ==========================================

const Booking =
  mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);


module.exports = Booking;