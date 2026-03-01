const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

// Define Mongoose schema and model for User
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, default: "applicant" },
    companyName: { type: String, index: true }, // Company name for recruiters
    companyId: { type: String }, // For future company grouping
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },

    // Guest/Demo account fields
    isGuest: { type: Boolean, default: false, index: true },
    guestMetadata: {
      createdAt: { type: Date, default: null },
      originalRole: { type: String, default: null }, // Track original role for analytics
      roleSwitchCount: { type: Number, default: 0 }, // Track how many times role was switched
      upgradedAt: { type: Date, default: null }, // Track if/when upgraded to full account
    },
  },
  { timestamps: true }
);

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
