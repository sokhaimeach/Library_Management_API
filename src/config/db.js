const mongoose = require("mongoose");
const MONGODB_URL = process.env.MONGODB_URL;

const connectDB = async () => {
  await mongoose
    .connect(MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
