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
    <div className="container p-4 bg-light shadow-sm rounded mb-5" style={{ maxWidth: "720px" }}>
      <h2 className="text-center fw-bold mb-4">BMI Calculator</h2>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="form-control" placeholder="e.g. 60" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Height (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="form-control" placeholder="e.g. 170" />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Age</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="form-control" placeholder="e.g. 25" />
      </div>

      <div className="mb-3">
        <label className="form-label">Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="form-select">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Activity Level</label>
        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="form-select">
          <option value="sedentary">Sedentary (Little to no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="very_active">Very Active (Athlete training)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label">Meal Preferences</label>
        <div className="row">
          {mealPreferencesList.map((preference, index) => (
            <div className="col-12 mb-2" key={index}>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedPreferences.includes(preference.name)}
                  onChange={() => handleCheckboxChange(preference.name)}
                  id={`pref-${index}`}
                />
                <label className="form-check-label" htmlFor={`pref-${index}`}>
                  {preference.name} <small className="text-muted">– {preference.description}</small>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-grid mb-3">
        <button onClick={calculateBMI} className="btn btn-primary">
          Calculate BMI
        </button>
      </div>

      {bmi && (
        <div className="text-center mt-4">
          <p className="fs-5 fw-semibold">Your BMI: {bmi}</p>
          <p className="text-muted">Category: {message}</p>
          {recommendedCalories && (
            <p className="text-muted">Recommended Daily Calories: <strong>{recommendedCalories} kcal</strong></p>
          )}
          <div className="d-grid mt-3">
            <button onClick={saveAndNavigate} className="btn btn-success">
              Go to Diet Meal Planner
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default BMICalculator;