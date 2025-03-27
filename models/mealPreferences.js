const mongoose = require("mongoose");

const mealPreferencesSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  activityLevel: { 
    type: String, 
    enum: ["sedentary", "light", "moderate", "active", "very_active"], 
    required: true 
  },
  bmi: { type: Number },
  bmiCategory: {
    type: String,
    enum: ["Underweight", "Normal weight", "Overweight", "Obese"],
    default: "Normal weight"
  },
  bmr: { type: Number },
  tdee: { type: Number },
  recommendedCalories: { type: Number },
  preferences: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const Meal = mongoose.model("Meal", mealPreferencesSchema);
module.exports = Meal;
