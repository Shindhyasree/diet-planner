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
  if (Array.isArray(meal)) {
    user.mealLogs.push(...meal);
  } else {
    user.mealLogs.push(meal);
  }
  await user.save();
  res.json({ message: "Meal(s) logged successfully", mealLogs: user.mealLogs });
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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});