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
  const navigate = useNavigate();

  const calculateBMI = () => {
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
    if (!height || !weight || !bmi) {
      alert("Please enter height and weight, then calculate BMI before proceeding.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:5000/meal-preferences/${userId}`, {
        height,
        weight,
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
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="w-100">
          <label className="block text-gray-700">Height (cm):</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <div className="my-4 d-flex flex-column gap-4">
        <label className="block text-gray-700 font-semibold">Meal Preferences:</label>
        <div className="d-flex flex-column gap-3">
          {mealPreferencesList.map((preference, index) => (
            <label key={index} className="flex items-center gap-2">
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
      </div>
      <div className="text-center">
        <button onClick={calculateBMI} className="bg-primary text-white p-2 rounded w-1/2">
          Calculate BMI
        </button>
      </div>
      {bmi && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Your BMI: {bmi}</p>
          <p className="text-gray-700">Category: {message}</p>
          <button
            onClick={saveAndNavigate}
            className="w-full bg-primary text-white p-2 rounded mt-4"
          >
            Go to Diet Meal Planner
          </button>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;