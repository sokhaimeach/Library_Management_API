const mongoose = require("mongoose");

const BookCopySchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "books",
  },
  status: {
    type: String,
    enum: ["available", "unavailable", "lost"],
    default: "available",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("bookcopies", BookCopySchema);
