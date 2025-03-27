const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { SerialPort } = require("serialport");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();
const User = require("./models/users");
const Meal = require("./models/mealPreferences");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/diet_meal_planner")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 18.5 && bmi < 24.9) category = "Normal weight";
  else if (bmi >= 25 && bmi < 29.9) category = "Overweight";
  else category = "Obese";
  return { bmi, category };
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi < 24.9) return "Normal weight";
  if (bmi >= 25 && bmi < 29.9) return "Overweight";
  return "Obese";
};

function calculateBMR(weight, height, age, gender) {
  if (gender === "male") {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

function calculateTDEE(bmr, activityLevel) {
  const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
  };
  return bmr * (activityFactors[activityLevel] || 1.2);
}

const mealsData = JSON.parse(fs.readFileSync(path.join(__dirname, "meals.json"), "utf-8"));

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, mealLogs: [], waterIntake: 0 });
  await newUser.save();
  res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

app.post("/logMeal/:id", async (req, res) => {
  const { id } = req.params;
  const { meal } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const mealPreferences = await Meal.findOne({ email: user.email });
  if (!mealPreferences) return res.status(404).json({ message: "Meal preferences not found" });
  let totalCaloriesConsumed = user.mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0);
  if (Array.isArray(meal)) {
    user.mealLogs.push(...meal);
    totalCaloriesConsumed += meal.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  } else {
    user.mealLogs.push(meal);
    totalCaloriesConsumed += Number(meal.calories) || 0;
  }
  await user.save();
  const recommendedCalories = mealPreferences.recommendedCalories || 2000;
  let alertMessage = `You have consumed ${totalCaloriesConsumed} calories out of your recommended ${recommendedCalories} calories.`;
  if (totalCaloriesConsumed > recommendedCalories) {
    alertMessage += " ⚠️ You have exceeded your recommended daily intake!";
  } else if (totalCaloriesConsumed < recommendedCalories * 0.8) {
    alertMessage += " ℹ️ Consider eating more to meet your daily needs.";
  }
  res.json({
    message: "Meal(s) logged successfully",
    mealLogs: user.mealLogs,
    alert: alertMessage,
  });
});

app.get("/mealLogs/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ mealLogs: user.mealLogs });
});

app.put("/updateWaterIntake/:id", async (req, res) => {
  const { id } = req.params;
  const { waterIntake } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.waterIntake = waterIntake;
  await user.save();
  res.json({ waterIntake: user.waterIntake });
});

app.get("/waterIntake/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ waterIntake: user.waterIntake });
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ name: user.name });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/meal-preferences/:id", async (req, res) => {
  const { id } = req.params;
  const { height, weight, preferences } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { bmi, category } = calculateBMI(weight, height);
    const email = user.email;
    let pipeline = await Meal.findOne({ email });
    if (!pipeline) {
      pipeline = new Meal({
        email,
        height,
        weight,
        bmi,
        bmiCategory: category,
        preferences,
      });
    } else {
      pipeline.height = height;
      pipeline.weight = weight;
      pipeline.bmi = bmi;
      pipeline.bmiCategory = category;
      pipeline.preferences = preferences;
    }
    await pipeline.save();
    res.status(200).json({
      message: "Preferences saved successfully",
      bmi,
      category,
      redirectUrl: `/dietmealplanner/${id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/meals", (req, res) => {
  try {
    const preferences = req.query.preferences ? req.query.preferences.split(",") : [];
    if (preferences.length === 0) {
      return res.status(200).json(mealsData);
    }
    const filteredMeals = mealsData.filter(meal =>
      meal.preferences.some(pref => preferences.includes(pref))
    );
    res.status(200).json(filteredMeals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/calorie-intake", async (req, res) => {
  const { bmi, weight, height, age, gender, activityLevel, userId } = req.body;
  if (!bmi || !weight || !height || !age || !gender || !activityLevel || !userId) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    let recommendedCalories;
    if (bmi < 18.5) {
      recommendedCalories = tdee + 500;
    } else if (bmi >= 25) {
      recommendedCalories = tdee - 500;
    } else {
      recommendedCalories = tdee;
    }
    let userCalorieData = await Meal.findOne({ email: user.email });
    if (!userCalorieData) {
      userCalorieData = new Meal({
        email: user.email,
        height,
        weight,
        age,
        gender,
        activityLevel,
        bmi,
        bmiCategory: getBMICategory(bmi),
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        recommendedCalories: Math.round(recommendedCalories),
      });
    } else {
      userCalorieData.height = height;
      userCalorieData.weight = weight;
      userCalorieData.age = age;
      userCalorieData.gender = gender;
      userCalorieData.activityLevel = activityLevel;
      userCalorieData.bmi = bmi;
      userCalorieData.bmiCategory = getBMICategory(bmi);
      userCalorieData.bmr = Math.round(bmr);
      userCalorieData.tdee = Math.round(tdee);
      userCalorieData.recommendedCalories = Math.round(recommendedCalories);
    }
    await userCalorieData.save();
    res.status(200).json({
      message: "Calorie intake calculated and saved successfully",
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      recommendedCalories: Math.round(recommendedCalories),
    });
  } catch (error) {
    console.error("Error processing calorie intake:", error);
    res.status(500).json({ error: "Server error" });
  }
});

const clearDailyMealLogs = async () => {
  try {
    await User.updateMany({}, { $set: { mealLogs: [], waterIntake: 0 } });
    console.log("✅ All meal logs have been cleared for the day.");
  } catch (error) {
    console.error("❌ Error clearing meal logs:", error);
  }
};

cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running daily meal log cleanup...");
  await clearDailyMealLogs();
  console.log("✅ Daily meal log cleanup completed.");
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});