
const express = require("express");
const { sendContactMail } = require("../controllers/contactController");

const router = express.Router();

// POST /api/contact
router.post("/", sendContactMail);




module.exports = router;
