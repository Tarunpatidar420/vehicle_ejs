const Booking = require("../models/Booking");
const Car = require("../models/Car");

// =====================================================
// CHECK AVAILABILITY
// =====================================================

const checkAvailabilityOfCar = async (req, res) => {
  try {
    const cars = await Car.find({
      isAvailable: true,
    });

    const availableCars = cars.filter(
      (car) => car.availableCount > 0
    );

    res.json({
      success: true,
      availableCars,
    });
  } catch (error) {
    console.error("Check availability error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CREATE BOOKING
// =====================================================

const createBooking = async (req, res) => {
  try {
    // -----------------------------------------------
    // Login check
    // -----------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    const {
      car,
      pickupDate,
      returnDate,
      name,
      email,
      whatsapp,
      address,
      pincode,
      vehicleUse,
      otherUse,
      paymentMethod,
    } = req.body;

    // -----------------------------------------------
    // Basic validation
    // -----------------------------------------------

    if (!car) {
      return res.json({
        success: false,
        message: "Vehicle is required",
      });
    }

    if (!name) {
      return res.json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!whatsapp) {
      return res.json({
        success: false,
        message: "WhatsApp number is required",
      });
    }

    if (!address) {
      return res.json({
        success: false,
        message: "Address is required",
      });
    }

    if (!pincode) {
      return res.json({
        success: false,
        message: "Pincode is required",
      });
    }

    if (!vehicleUse) {
      return res.json({
        success: false,
        message: "Vehicle use is required",
      });
    }

    // -----------------------------------------------
    // Validate dates
    // -----------------------------------------------

    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);

    if (
      isNaN(picked.getTime()) ||
      isNaN(returned.getTime())
    ) {
      return res.json({
        success: false,
        message: "Invalid pickup or return date",
      });
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (picked < today) {
      return res.json({
        success: false,
        message: "Pickup date cannot be past",
      });
    }

    if (returned <= picked) {
      return res.json({
        success: false,
        message: "Return date must be after pickup",
      });
    }

    // -----------------------------------------------
    // Reduce vehicle availability
    // -----------------------------------------------

    const carData = await Car.findOneAndUpdate(
      {
        _id: car,
        availableCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          availableCount: -1,
        },
      },
      {
        new: true,
      }
    );

    if (!carData) {
      return res.json({
        success: false,
        message: "Vehicle unavailable",
      });
    }

    // -----------------------------------------------
    // Update vehicle availability
    // -----------------------------------------------

    carData.isAvailable =
      carData.availableCount > 0;

    await carData.save();

    // -----------------------------------------------
    // Calculate total days
    // -----------------------------------------------

    const totalDays = Math.max(
      1,
      Math.ceil(
        (returned - picked) /
          (1000 * 60 * 60 * 24)
      )
    );

    // -----------------------------------------------
    // Calculate price
    // -----------------------------------------------

    const price =
      carData.pricePerDay * totalDays;

    // -----------------------------------------------
    // Create booking
    // -----------------------------------------------

    const booking = await Booking.create({
      car: carData._id,

      owner: carData.owner,

      user: req.user._id,

      pickupDate: picked,

      returnDate: returned,

      price,

      name,

      email,

      whatsapp,

      address,

      pincode,

      vehicleUse,

      otherUse: otherUse || "",

      paymentMethod:
        paymentMethod || "offline",

      status: "pending",

      // New booking is not cancelled
      cancelledBy: null,
    });

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// USER CANCEL BOOKING
// =====================================================

const cancelBooking = async (req, res) => {
  try {
    // -----------------------------------------------
    // Login check
    // -----------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    // -----------------------------------------------
    // Find booking
    // -----------------------------------------------

    const booking =
      await Booking.findById(req.params.id);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------------------------
    // User authorization
    // -----------------------------------------------

    if (
      !booking.user ||
      booking.user.toString() !==
        req.user._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // -----------------------------------------------
    // Already cancelled
    // -----------------------------------------------

    if (booking.status === "cancelled") {
      return res.json({
        success: false,
        message: "Already cancelled",
      });
    }

    // -----------------------------------------------
    // Cancel booking
    // -----------------------------------------------

    booking.status = "cancelled";

    // VERY IMPORTANT
    // This booking was cancelled by USER
    booking.cancelledBy = "user";

    await booking.save();

    // -----------------------------------------------
    // Restore vehicle availability
    // -----------------------------------------------

    const car =
      await Car.findById(booking.car);

    if (car) {
      const quantity =
        Number(booking.quantity) || 1;

      car.availableCount += quantity;

      car.isAvailable =
        car.availableCount > 0;

      await car.save();
    }

    res.json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXCHANGE BOOKING VEHICLE
// =====================================================

const exchangeBookingVehicle = async (
  req,
  res
) => {
  try {
    const { newCarId } = req.body;

    // -----------------------------------------------
    // Find booking
    // -----------------------------------------------

    const booking =
      await Booking.findById(req.params.id);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------------------------
    // Cancelled booking cannot exchange
    // -----------------------------------------------

    if (
      booking.status === "cancelled"
    ) {
      return res.json({
        success: false,
        message:
          "Cancelled booking cannot exchange",
      });
    }

    // -----------------------------------------------
    // Get old vehicle
    // -----------------------------------------------

    const oldCar =
      await Car.findById(booking.car);

    // -----------------------------------------------
    // Get new vehicle
    // -----------------------------------------------

    const newCar =
      await Car.findOne({
        _id: newCarId,
        availableCount: {
          $gt: 0,
        },
      });

    if (!newCar) {
      return res.json({
        success: false,
        message:
          "New vehicle unavailable",
      });
    }

    // -----------------------------------------------
    // Quantity
    // -----------------------------------------------

    const quantity =
      Number(booking.quantity) || 1;

    // -----------------------------------------------
    // Check new vehicle quantity
    // -----------------------------------------------

    if (newCar.availableCount < quantity) {
      return res.json({
        success: false,
        message:
          "New vehicle quantity unavailable",
      });
    }

    // -----------------------------------------------
    // Restore old vehicle
    // -----------------------------------------------

    if (oldCar) {
      oldCar.availableCount += quantity;

      oldCar.isAvailable =
        oldCar.availableCount > 0;

      await oldCar.save();
    }

    // -----------------------------------------------
    // Reduce new vehicle
    // -----------------------------------------------

    newCar.availableCount -= quantity;

    newCar.isAvailable =
      newCar.availableCount > 0;

    await newCar.save();

    // -----------------------------------------------
    // Calculate total days
    // -----------------------------------------------

    const totalDays = Math.max(
      1,
      Math.ceil(
        (
          new Date(
            booking.returnDate
          ) -
          new Date(
            booking.pickupDate
          )
        ) /
          (1000 * 60 * 60 * 24)
      )
    );

    // -----------------------------------------------
    // Calculate new price
    // -----------------------------------------------

    const newPrice =
      newCar.pricePerDay * totalDays;

    // -----------------------------------------------
    // Update booking
    // -----------------------------------------------

    booking.car = newCar._id;

    booking.owner = newCar.owner;

    booking.price = newPrice;

    await booking.save();

    res.json({
      success: true,
      message:
        "Vehicle exchanged successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Exchange vehicle error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET USER BOOKINGS
// =====================================================

const getUserBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        user: req.user._id,
      })
        .populate("car")
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get user bookings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET OWNER BOOKINGS
// =====================================================

const getOwnerBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        owner: req.user._id,
      })
        .populate("car")
        .populate("user")
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get owner bookings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// OWNER CHANGE BOOKING STATUS
// =====================================================

const changeBookingStatus = async (
  req,
  res
) => {
  try {
    const {
      bookingId,
      status,
    } = req.body;

    // -----------------------------------------------
    // Validate status
    // -----------------------------------------------

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status",
      });
    }

    // -----------------------------------------------
    // Find booking
    // -----------------------------------------------

    const booking =
      await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found",
      });
    }

    // -----------------------------------------------
    // Owner authorization
    // -----------------------------------------------

    if (
      !booking.owner ||
      booking.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const previousStatus =
      booking.status;

    // -----------------------------------------------
    // Change status
    // -----------------------------------------------

    booking.status = status;

    // -----------------------------------------------
    // Cancellation source
    // -----------------------------------------------

    if (status === "cancelled") {
      // Owner cancelled this booking
      booking.cancelledBy = "owner";
    } else {
      // Booking is no longer cancelled
      booking.cancelledBy = null;
    }

    await booking.save();

    // -----------------------------------------------
    // Restore vehicle only when
    // owner newly cancels booking
    // -----------------------------------------------

    if (
      status === "cancelled" &&
      previousStatus !== "cancelled"
    ) {
      const car =
        await Car.findById(booking.car);

      if (car) {
        const quantity =
          Number(booking.quantity) || 1;

        car.availableCount += quantity;

        car.isAvailable =
          car.availableCount > 0;

        await car.save();
      }
    }

    res.json({
      success: true,
      message:
        "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Change booking status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteBooking = async (
  req,
  res
) => {
  try {
    // -----------------------------------------------
    // Login check
    // -----------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }


    // -----------------------------------------------
    // Find booking
    // -----------------------------------------------

    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }


    // -----------------------------------------------
    // OWNER AUTHORIZATION
    // -----------------------------------------------

    if (
      !booking.owner ||
      booking.owner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }



    await Booking.findByIdAndDelete(
      req.params.id
    );


    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    return res.json({
      success: true,
      message:
        "Booking deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete booking",
    });
  }
};

// =====================================================
// USER DELETE BOOKING
// =====================================================
//
// USER CAN DELETE ONLY THEIR OWN BOOKING
// IF:
//
// status === "cancelled"
// AND
// cancelledBy === "user"
// =====================================================

const userDeleteBooking = async (req, res) => {
  try {

    // -----------------------------------------------
    // Login check
    // -----------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }


    // -----------------------------------------------
    // Find booking
    // -----------------------------------------------

    const booking = await Booking.findById(
      req.params.id
    );


    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }


    // -----------------------------------------------
    // USER AUTHORIZATION
    // User can delete only their own booking
    // -----------------------------------------------

    if (
      !booking.user ||
      booking.user.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can delete only your own booking",
      });
    }


    // -----------------------------------------------
    // ONLY CANCELLED BOOKING CAN BE DELETED
    // -----------------------------------------------

    if (booking.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Only cancelled bookings can be deleted",
      });
    }


    // -----------------------------------------------
    // DELETE BOOKING
    //
    // NO cancelledBy CHECK
    // -----------------------------------------------

    await Booking.findByIdAndDelete(
      req.params.id
    );


    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    return res.json({
      success: true,
      message:
        "Booking deleted successfully",
    });


  } catch (error) {

    console.error(
      "User delete booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to delete booking",
    });
  }
};
// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  checkAvailabilityOfCar,
  createBooking,
  cancelBooking,
  exchangeBookingVehicle,
  getUserBookings,
  getOwnerBookings,
  changeBookingStatus,
  deleteBooking,
  userDeleteBooking,
};