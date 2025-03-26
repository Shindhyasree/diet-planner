const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mealLogs: [{ itemName: String, calories: Number }],
  waterIntake: { type: Number, default: 0 },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;