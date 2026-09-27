
const nodemailer = require("nodemailer");

const sendContactMail = async (req, res) => {
  try {
    const {
      name,
      email,
      whatsapp,
      profession,
      otherProfession,
      description,
      linkedin,
      instagram,
      facebook,
    } = req.body || {};

    // basic validation
    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    // Owner details
    const OWNER_EMAIL =
      process.env.OWNER_EMAIL || "tarunpatidarrupariya@gmail.com";
    const OWNER_NAME = process.env.OWNER_NAME || "Tarun Patidar";

    // SMTP credentials
    const SMTP_USER = process.env.SMTP_USER || OWNER_EMAIL;
    const SMTP_PASS = process.env.SMTP_PASS || process.env.OWNER_PASS;

    if (!SMTP_USER || !SMTP_PASS) {
      console.error("SMTP credentials missing. Set SMTP_USER and SMTP_PASS in .env");
      return res
        .status(500)
        .json({ success: false, message: "Mail configuration missing" });
    }

    
   // transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,       
  requireTLS: true,    
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});




    // ================================
    //  Owner Email (User details)
    // ================================
    const ownerHtml = `
      <h2> New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp || "--"}</p>
      <p><strong>Profession:</strong> ${profession || "--"} ${
      profession === "Other" ? `(${otherProfession || "--"})` : ""
    }</p>
      <p><strong>Description:</strong></p>
      <p>${(description || "--").replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><strong>Social Links:</strong></p>
      <p> LinkedIn: ${linkedin || "--"}</p>
      <p> Instagram: ${instagram || "--"}</p>
      <p> Facebook: ${facebook || "--"}</p>
      <p style="font-size:12px;color:#666;margin-top:10px;">Received at: ${new Date().toLocaleString()}</p>
    `;

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      replyTo: email,
      to: OWNER_EMAIL,
      subject: `New contact from ${name} (${email})`,
      html: ownerHtml,
    });

    // ================================
    //  User Confirmation + Services & Offers
    // ================================
    const userHtml = `
      <h2> Thanks for contacting ${OWNER_NAME}</h2>
      <p>Hi ${name},</p>
      <p>We received your message and will get back to you shortly. Below is a copy of what you submitted:</p>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp || "--"}</p>
      <p><strong>Profession:</strong> ${profession || "--"} ${
      profession === "Other" ? `(${otherProfession || "--"})` : ""
    }</p>
      <p><strong>Description:</strong></p>
      <p>${(description || "--").replace(/\n/g, "<br/>")}</p>

      <hr/>

      <h2 style="color:#0558FE;"> Our Vehicle Rental Services</h2>
      <p>At <b>${OWNER_NAME} Vehicle Rentals</b>, we provide a wide range of vehicles and machines for all your needs at <b>affordable prices</b>:</p>

      <ul style="line-height:1.8; font-size:15px; color:#333;">
        <li> <b>Cars</b> — Family & business trips</li>
        <li> <b>Bikes</b> — Sport & commuter bikes</li>
        <li> <b>Tractors</b> — Agriculture & farming use</li>
        <li> <b>Harvesting Machines</b></li>
        <li> <b>Seed Drills, Cultivators, Rotavators</b></li>
      </ul>

      <h3 style="color:#28a745;"> Current Discounts & Offers</h3>
      <ul style="line-height:1.8; font-size:15px; color:#444;">
        <li> 20% OFF on first booking</li>
        <li> Weekend Special: Book 2 days, get 1 day FREE</li>
        <li> Special discount for students & farmers</li>
      </ul>

      <p style="margin-top:15px; font-size:14px; color:#555;">
        Hurry up! Offers are for a limited time only. Book your vehicle today and enjoy a hassle-free rental experience 🚀
      </p>

      <hr/>
      <p>If you need immediate help, contact: ${OWNER_NAME} — ${OWNER_EMAIL}</p>
      <p style="font-size:12px;color:#666;margin-top:10px;">Sent: ${new Date().toLocaleString()}</p>
    `;

    await transporter.sendMail({
      from: `"${OWNER_NAME}" <${OWNER_EMAIL}>`,
      to: email,
      subject: `Welcome to ${OWNER_NAME} Vehicle Rentals `,
      html: userHtml,
    });

    return res.json({
      success: true,
      message: "Emails sent to owner and user with services & offers",
    });
  } catch (error) {
    console.error("Contact mail error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send mails" });
  }
};


module.exports = { sendContactMail };
