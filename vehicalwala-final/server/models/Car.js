const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const carSchema = new mongoose.Schema(
  {
    //  Owner reference
    owner: { type: ObjectId, ref: "User", required: true },

    //  Brand 
    brand: {
      type: [String],
      required: true,
      validate: (v) => v.length > 0,
      set: (v) => v.map((b) => b.trim().toLowerCase()), // normalize
    },

    model: { type: String, required: true, trim: true },

    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },

    categories: {
      type: [String],
      required: true,
      validate: (v) => v.length > 0,
      set: (v) => v.map((c) => c.trim().toLowerCase()), // normalize
    },

    seating_capacity: { type: Number, required: true, min: 1 },
    fuel_type: { type: String, required: true, trim: true },
    transmission: { type: String, required: true, trim: true },

    pricePerDay: { type: Number, required: true, min: 1 },

    discount: { type: Number, default: 0, min: 0, max: 100 },

    
    availableCount: { type: Number, required: true, default: 1, min: 0 },

    location: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    description: { type: String, default: "" },

    images: {
      type: [String],
      default: [],
      validate: (v) => v.length <= 4,
    },

    //  runtime update based on stock
    isAvailable: { type: Boolean, default: true },

    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//  Auto-update isAvailable before save
carSchema.pre("save", function (next) {
  this.isAvailable = this.availableCount > 0;
  next();
});

//   Offer  based on discount
carSchema.virtual("offer").get(function () {
  if (!this.discount || this.discount <= 0) return "";

  if (this.discount >= 90) return "Unbelievable Offer ";
  if (this.discount >= 70) return "Mega Offer ";
  if (this.discount >= 50) return "Big Offer ";
  if (this.discount >= 30) return "Special Offer ";

  return "";
});

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);



module.exports = Car;
