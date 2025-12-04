const mongoose = require("mongoose");

const BorrowSchema = mongoose.Schema({
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "members",
  },
  copy_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "bookcopies",
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "books",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  borrow_date: {
    type: Date,
    default: Date.now,
  },
  due_date: {
    type: Date,
  },
  return_date: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["overdue", "returned", "lost", "late", "damaged"],
    default: "overdue",
  },
});

BorrowSchema.pre("save", async function () {
  const Member = mongoose.model("members");
  const member = await Member.findById(this.member_id);
  if (!member) {
    throw new Error("Member not found");
  }
  let dayToAdd = 7;
  if (member.member_type === "vip") {
    dayToAdd = 14;
  }
  this.due_date = new Date(
    this.borrow_date.getTime() + dayToAdd * 24 * 60 * 60 * 1000,
  );
});

module.exports = mongoose.model("borrowrecords", BorrowSchema);
