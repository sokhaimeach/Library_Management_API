const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/user.route");
const connectDB = require("./config/db");
const categoriesRoutes = require("./routes/category.route");
const authorsRoutes = require("./routes/author.route");
const membersRoutes = require("./routes/member.route");
const bookRoutes = require("./routes/book.route");
const borrowRecordRoutes = require("./routes/borrowrecord.route");
const penaltyRoutes = require("./routes/penalty.route");

// Initialize MongoDB connection
connectDB();

// Initialize CORS middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/categories", categoriesRoutes);
app.use("/authors", authorsRoutes);
app.use("/members", membersRoutes);
app.use("/books", bookRoutes);
app.use("/borrowrecord", borrowRecordRoutes);
app.use("/penalties", penaltyRoutes);

module.exports = app;
