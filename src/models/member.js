const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  join_date: {
    type: Date,
    default: Date.now,
  },
  contact: {
    phone_number: {
      type: String,
      required: true,
      minlength: 9,
      maxlength: 15,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      match: /.+@.+\..+/,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
  },
  member_type: {
    type: String,
    enum: ["regular", "vip", "blacklist"],
    default: "regular",
  },
});

module.exports = mongoose.model("members", MemberSchema);
