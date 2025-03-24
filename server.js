// server.js (Updated Backend Code)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { SerialPort } = require("serialport");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/diet_meal_planner")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mealLogs: [{ itemName: String, calories: Number }],
  waterIntake: Number,
});
const User = mongoose.model("User", UserSchema);

// Register User
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

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ message: "Login successful", user });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
});

// Log Meal
app.post("/logMeal", async (req, res) => {
  const { email, meal } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (Array.isArray(meal)) {
    user.mealLogs.push(...meal); // Spread operator
  } else {
    user.mealLogs.push(meal);
  }
  await user.save();
  res.json({ message: "Meal(s) logged successfully", mealLogs: user.mealLogs });
});


// Fetch Meal Logs
app.get("/mealLogs/:email", async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ mealLogs: user.mealLogs });
});

// Update Water Intake
app.put("/updateWaterIntake/:email", async (req, res) => {
  const { email, waterIntake } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.waterIntake = waterIntake;
  await user.save();
  res.json({ waterIntake: user.waterIntake });
});

// Fetch Water Intake
app.get("/waterIntake/:email", async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ waterIntake: user.waterIntake });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});