const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, //  IMPORTANT
    });

    console.log(" MongoDB Connected");
    console.log(" Database Name:", conn.connection.name);

  } catch (error) {
    console.error(" MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};




module.exports = connectDB;
