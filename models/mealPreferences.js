const mongoose = require("mongoose");

const mealPreferencesSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number },
  bmiCategory: {
    type: String,
    enum: ["Underweight", "Normal weight", "Overweight", "Obese"],
    default: "Normal weight"
  },
  preferences: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const Meal = mongoose.model("Meal", mealPreferencesSchema);
module.exports = Meal;