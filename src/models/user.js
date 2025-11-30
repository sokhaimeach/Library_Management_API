const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 4,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "librarian", "stock-keeper"],
  },
  image_url: {
    type: String,
    default: null,
  },
  status: {
    type: Boolean,
    default: true,
  },
  start_date: {
    type: Date,
    default: Date.now,
  },
  contact: {
    phone_number: {
      type: String,
      required: true,
      trim: true,
      minlength: 9,
      maxlength: 15,
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
  address: {
    village: {
      type: String,
      default: null,
      trim: true,
    },
    commune: {
      type: String,
      default: null,
      trim: true,
    },
    district: {
      type: String,
      default: null,
      trim: true,
    },
    city: {
      type: String,
      default: null,
      trim: true,
    },
  },
});

// hash or encrypt password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// compare password
UserSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

module.exports = mongoose.model("users", UserSchema);
