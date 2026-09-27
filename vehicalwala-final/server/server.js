require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const dns = require("dns");

const connectDB = require("./configs/db");

const userRouter = require("./routes/userRoutes");
const ownerRouter = require("./routes/ownerRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const vehicleRouter = require("./routes/vehicleRoutes");
const contactRouter = require("./routes/contactRoute");
const authRouter = require("./routes/authRoutes");


// =====================================================
// DNS
// =====================================================

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);


// =====================================================
// APP
// =====================================================

const app = express();


// =====================================================
// ROOT PATH
// =====================================================

const ROOT = path.join(__dirname, "..");


// =====================================================
// EJS CONFIGURATION
// =====================================================

app.set("view engine", "ejs");

app.set(
  "views",
  path.join(ROOT, "views")
);


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);


// =====================================================
// STATIC FILES
// =====================================================

app.use(
  express.static(
    path.join(ROOT, "public")
  )
);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/user",
  userRouter
);

app.use(
  "/api/owner",
  ownerRouter
);

app.use(
  "/api/bookings",
  bookingRouter
);

app.use(
  "/api/vehicles",
  vehicleRouter
);

app.use(
  "/api/contact",
  contactRouter
);

app.use(
  "/api/auth",
  authRouter
);


// =====================================================
// COMMON PAGE RENDER FUNCTION
// =====================================================

const page = (
  name,
  data = {}
) => {
  return (req, res) => {
    res.render(
      name,
      {
        title: "VehicalWala",
        ...data
      }
    );
  };
};


// =====================================================
// PUBLIC PAGES
// =====================================================

// Home
app.get(
  "/",
  page("home")
);


// Vehicles
app.get(
  "/cars",
  (req, res) => {
    res.render(
      "cars",
      {
        title: "Available Vehicles",

        pickupLocation:
          req.query.pickupLocation || "",

        pickupDate:
          req.query.pickupDate || "",

        returnDate:
          req.query.returnDate || ""
      }
    );
  }
);


// Vehicle Details
app.get(
  "/car-details/:id",
  (req, res) => {
    res.render(
      "car-details",
      {
        title: "Vehicle Details",
        id: req.params.id
      }
    );
  }
);


// My Bookings
app.get(
  "/my-bookings",
  (req, res) => {
    res.render(
      "my-bookings",
      {
        title: "My Bookings"
      }
    );
  }
);


// Forgot Password
app.get(
  "/forgot-password",
  page("forgot-password")
);


// Reset Password
app.get(
  "/reset-password/:token",
  (req, res) => {
    res.render(
      "reset-password",
      {
        title: "Reset Password",
        token: req.params.token
      }
    );
  }
);



app.get(
  "/owner",
  (req, res) => {
    res.redirect(
      "/owner/dashboard"
    );
  }
);


// -----------------------------------------------------
// OWNER DASHBOARD
// -----------------------------------------------------

app.get(
  "/owner/dashboard",
  (req, res) => {
    res.render(
      "owner/dashboard",
      {
        title: "Owner Dashboard"
      }
    );
  }
);


// -----------------------------------------------------
// ADD CAR
// -----------------------------------------------------

app.get(
  "/owner/add-car",
  page("owner/add-car")
);


// -----------------------------------------------------
// MANAGE CARS
// -----------------------------------------------------

app.get(
  "/owner/manage-cars",
  page("owner/manage-cars")
);


// -----------------------------------------------------
// MANAGE BOOKINGS
// -----------------------------------------------------

app.get(
  "/owner/manage-bookings",
  page("owner/manage-bookings")
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "Global Error:",
      err
    );

    if (
      req.path.startsWith("/api/")
    ) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).render(
      "error",
      {
        title: "Error",
        message: err.message
      }
    );
  }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {

    if (
      req.path.startsWith("/api/")
    ) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Route not found"
        });
    }

    res.status(404).render(
      "error",
      {
        title: "Not Found",
        message: "Page not found"
      }
    );
  }
);


// =====================================================
// DATABASE + SERVER
// =====================================================

connectDB()
  .then(() => {

    const PORT =
      process.env.PORT || 5000;

    app.listen(
      PORT,
      () => {
        console.log(
          `VehicalWala EJS server running on port ${PORT}`
        );

        console.log(
          `http://localhost:${PORT}`
        );
      }
    );
  })
  .catch((error) => {

    console.error(
      "Database connection failed:",
      error
    );

    process.exit(1);
  });