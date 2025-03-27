import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import mealPreferencesList from "../mealsPreferences.json";
import axios from "axios";

const BMICalculator = () => {
  const { userId } = useParams();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [recommendedCalories, setRecommendedCalories] = useState(null);
  const navigate = useNavigate();
  
  const calculateBMI = async () => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);
      setBMI(bmiValue);
      let category = "";
      if (bmiValue < 18.5) category = "Underweight";
      else if (bmiValue >= 18.5 && bmiValue < 24.9) category = "Normal weight";
      else if (bmiValue >= 25 && bmiValue < 29.9) category = "Overweight";
      else category = "Obese";
      setMessage(category);
      try {
        const response = await axios.post("http://localhost:5000/calorie-intake", {
          bmi: parseFloat(bmiValue),
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          gender,
          activityLevel,
          userId: userId
        });
        setRecommendedCalories(response.data.recommendedCalories);
      } catch (error) {
        console.error("Error fetching calorie intake recommendation:", error);
      }
    }
  };

  const handleCheckboxChange = (preference) => {
    setSelectedPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

  const saveAndNavigate = async () => {
    if (!height || !weight || !bmi || !age) {
      alert("Please enter height and weight, then calculate BMI before proceeding.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:5000/meal-preferences/${userId}`, {
        height,
        weight,
        age,
        gender,
        activityLevel,
        bmi,
        preferences: selectedPreferences || [],
      });
      if (response.status == 200 || 201) navigate(`/dietmealplanner/${userId}?preferences=${(selectedPreferences || []).join(",")}`);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg container">
      <h2 className="text-xl font-bold text-center mb-4">BMI Calculator</h2>
      <div className="d-flex gap-4 mb-4">
        <div className="w-100">
          <label className="block text-gray-700">Weight (kg):</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div className="w-100">
          <label className="block text-gray-700">Height (cm):</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-2 border rounded" />
        </div>
      </div>
      <div className="w-100 mb-4">
        <label className="block text-gray-700">Age:</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border rounded" />
      </div>
      <div className="w-100 mb-4">
        <label className="block text-gray-700">Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border rounded">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>
      <div className="w-100 mb-4">
        <label className="block text-gray-700">Activity Level:</label>
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="w-full p-2 border rounded">
          <option value="sedentary">Sedentary (Little to no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="very_active">Very Active (Athlete training)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Meal Preferences:</label>
        {mealPreferencesList.map((preference, index) => (
            <label key={index} className="flex items-center d-flex gap-3">
              <input
                type="checkbox"
                className="me-3"
                checked={selectedPreferences.includes(preference.name)}
                onChange={() => handleCheckboxChange(preference.name)}
              />
              <span>{preference.name} - <small>{preference.description}</small></span>
            </label>
          ))}
      </div>
      <div className="text-center">
        <button onClick={calculateBMI} className="bg-primary text-white p-2 rounded w-1/2">Calculate BMI</button>
      </div>
      {bmi && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Your BMI: {bmi}</p>
          <p className="text-gray-700">Category: {message}</p>
          {recommendedCalories && (
            <p className="text-gray-700">Recommended Daily Calories: {recommendedCalories} kcal</p>
          )}
          <button onClick={saveAndNavigate} className="w-full bg-primary text-white p-2 rounded mt-4">Go to Diet Meal Planner</button>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;