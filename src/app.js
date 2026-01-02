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
const authRoutes = require("./routes/auth.route");
const historyRoutes = require("./routes/history.route");

// Initialize MongoDB connection
connectDB();

// Initialize CORS middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/authors", authorsRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowrecord", borrowRecordRoutes);
app.use("/api/penalties", penaltyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

module.exports = app;
