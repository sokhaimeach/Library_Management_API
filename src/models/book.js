const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  cover_url: {
    type: String,
    required: true,
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "authors",
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "categories",
  },
  published_date: {
    type: Date,
    default: null,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total_copies: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    default: null,
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

module.exports = mongoose.model("books", BookSchema);
