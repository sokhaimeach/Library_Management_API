const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;
const userRoutes = require("./routers/user.route");

// Initialize CORS middleware
app.use(cors());
app.use(express.json());
// Initialize routes
app.use("/users", userRoutes);

// Initialize MongoDB connection
mongoose.connect(MONGODB_URL).then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
  });
});
