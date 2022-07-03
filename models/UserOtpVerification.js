const mongoose = require("mongoose");
const UserOtpSchema = mongoose.Schema({
  userId: {
    type: String,
    trim: true,
  },
  otp: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    trim: true,
  },
  expiresAt: {
    type: Date,
    trim: true,
  },
});
const UserOtpVerification = mongoose.model(
  "UserOtpVerification",
  UserOtpSchema
);
module.exports = UserOtpVerification;
