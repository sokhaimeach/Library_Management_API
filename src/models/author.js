const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  birth_date: {
    type: Date,
    default: null,
  },
  nationality: {
    type: String,
    default: null,
  },
  biography: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("authors", AuthorSchema);
