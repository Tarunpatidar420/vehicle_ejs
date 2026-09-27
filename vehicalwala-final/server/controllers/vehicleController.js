const Car = require("../models/Car");
const Booking = require("../models/Booking");


// Helper: Check Availability

const checkAvailability = async (car, pickupDate, returnDate) => {
  try {
    const bookings = await Booking.find({
      car: car._id,
      pickupDate: { $lte: returnDate },
      returnDate: { $gte: pickupDate },
      status: { $ne: "cancelled" }, //cancelled bookings ignore
    });

    //   already booked < car.availableCount 
    return bookings.length < (car.availableCount || 1);
  } catch (err) {
    console.error("Error in checkAvailability:", err.message);
    return false;
  }
};


//  Get Available Vehicles 

const getAvailableVehicles = async (req, res) => {
  try {
    let { pickupDate, returnDate } = req.query;

    //  Dates  safe parse 
    if (pickupDate) pickupDate = new Date(pickupDate);
    if (returnDate) returnDate = new Date(returnDate);

    
    let cars = await Car.find({ isAvailable: true, availableCount: { $gt: 0 } });

    
    const availablePromises = cars.map(async (car) => {
      const start = pickupDate || new Date();
      const end =
        returnDate || new Date(Date.now() + 24 * 60 * 60 * 1000); // default 1 din
      const isAvailable = await checkAvailability(car, start, end);
      return isAvailable ? car : null;
    });

    cars = (await Promise.all(availablePromises)).filter((c) => c !== null);

    res.json({ success: true, cars });
  } catch (error) {
    console.error("Error in getAvailableVehicles:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { getAvailableVehicles };
