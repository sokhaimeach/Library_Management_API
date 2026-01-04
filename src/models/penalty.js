const mongoose = require("mongoose");

const PenaltySchema = new mongoose.Schema({
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "members",
    required: true,
  },
  borrow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "borrowrecords",
    required: true,
  },
  penalty_type: {
    type: String,
    enum: ["lost", "late", "damage"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "paid", "replaced", "returned"],
    default: "pending",
  },
  note: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  received_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("penalties", PenaltySchema);
