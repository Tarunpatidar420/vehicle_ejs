const express = require("express");

const {
    checkAvailabilityOfCar,
    createBooking,
    getOwnerBookings,
    getUserBookings,
    cancelBooking,
    exchangeBookingVehicle,
    changeBookingStatus,
    deleteBooking,
    userDeleteBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/auth");

const bookingRouter = express.Router();


// =====================================================
// CHECK VEHICLE AVAILABILITY
// =====================================================

bookingRouter.get(
    "/check-availability",
    protect,
    checkAvailabilityOfCar
);


// =====================================================
// CREATE BOOKING
// =====================================================

bookingRouter.post(
    "/create",
    protect,
    createBooking
);


// =====================================================
// USER BOOKINGS
// =====================================================

bookingRouter.get(
    "/user",
    protect,
    getUserBookings
);


// =====================================================
// OWNER BOOKINGS
// =====================================================

bookingRouter.get(
    "/owner",
    protect,
    getOwnerBookings
);


// =====================================================
// OWNER CHANGE BOOKING STATUS
// pending / confirmed / cancelled / completed
// =====================================================

bookingRouter.put(
    "/change-status",
    protect,
    changeBookingStatus
);


// =====================================================
// USER CANCEL BOOKING
// =====================================================

bookingRouter.delete(
    "/:id/cancel",
    protect,
    cancelBooking
);


// =====================================================
// EXCHANGE VEHICLE
// =====================================================

bookingRouter.put(
    "/:id/exchange",
    protect,
    exchangeBookingVehicle
);


// =====================================================
// OWNER DELETE BOOKING
// =====================================================

bookingRouter.delete(
    "/delete/:id",
    protect,
    deleteBooking
);


// =====================================================
// USER DELETE OWN CANCELLED BOOKING
// =====================================================

bookingRouter.delete(
    "/user-delete/:id",
    protect,
    userDeleteBooking
);


module.exports = bookingRouter;