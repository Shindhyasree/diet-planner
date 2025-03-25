import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const calculateBMI = () => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);
      setBMI(bmiValue);
      determineBMICategory(bmiValue);
    }
  };

  const determineBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) {
      setMessage("Underweight");
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      setMessage("Normal weight");
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      setMessage("Overweight");
    } else {
      setMessage("Obese");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold text-center mb-4">BMI Calculator</h2>
      <div className="mb-2">
        <label className="block text-gray-700">Weight (kg):</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700">Height (cm):</label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={calculateBMI}
        className="w-full bg-blue-500 text-white p-2 rounded mt-2"
      >
        Calculate BMI
      </button>
      {bmi && (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Your BMI: {bmi}</p>
          <p className="text-gray-700">Category: {message}</p>
          <button
            onClick={() => navigate("/dashboard/shindhyasree@gmail.com")}
            className="w-full bg-green-500 text-white p-2 rounded mt-4"
          >
            Go to Diet Meal Planner
          </button>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;