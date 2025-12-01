const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/user.route");
const connectDB = require("./config/db");
const categoriesRoutes = require("./routes/category.route");
const authorsRoutes = require("./routes/author.route");

// Initialize MongoDB connection
connectDB();

// Initialize CORS middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/categories", categoriesRoutes);
app.use("/authors", authorsRoutes);

module.exports = app;
