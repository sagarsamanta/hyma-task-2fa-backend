const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: Number,
    trim: true,
  },
  verified: {
    type: Boolean,
    trim: true,
  },
});
const User = mongoose.model("UserOne", userSchema);
module.exports = User;
