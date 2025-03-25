import { useState, useEffect } from "react";
import axios from "axios";
import "./DietMealPlanner.css";

export default function DietMealPlanner({email}) {
  // State variables for meal, calories, etc.
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/mealLogs/${email}`);
        setMeals(response.data.mealLogs);
      } catch (error) {
        console.error("Error fetching meal logs: ", error);
      }
    };
    fetchMeals();
  }, [email]);

  useEffect(() => {
    const fetchWaterIntake = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/waterIntake/${email}`);
        setWaterIntake(response.data.waterIntake);
      } catch (error) {
        console.error("Error fetching water intake: ", error);
      }
    };
    fetchWaterIntake();
  }, [email]);

  const addMeal = async () => {
    if (!meal || !calories) return;
    const newMeal = { itemName: meal, calories };
    try {
      const response = await axios.post("http://localhost:5000/logMeal", {
        email,
        meal: newMeal,
      });
      setMeals(response.data.mealLogs);
      setMeal(""); // Reset input field
      setCalories("");
    } catch (error) {
      console.error("Error logging meal: ", error);
    }
  };

  const handleDrinkWater = async () => {
    try {
      console.log("Sending request to update water intake...");
      await axios.put(`http://localhost:5000/updateWaterIntake/${email}`, {
        email,
        waterIntake: waterIntake + 1,
      });
      const response = await axios.get(`http://localhost:5000/waterIntake/${email}`);
      setWaterIntake(response.data.waterIntake);
    } catch (error) {
      console.error("Error updating water intake:", error);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Diet Meal Planner</h1>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">Meal Tracking</h2>
          <div className="d-flex gap-2 mt-2">
            <input
              className="form-control"
              placeholder="Meal Name"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
            />
            <input
              className="form-control"
              placeholder="Calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <button className="btn btn-primary" onClick={addMeal}>Add</button>
          </div>
          <ul className="mt-3 list-group">
            {meals.map((m, index) => (
              <li key={index} className="list-group-item">
                {m.itemName} - {m.calories} kcal
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">Water Intake</h2>
          <p>You have consumed {waterIntake} glasses of water today.</p>
          <button className="btn btn-primary" onClick={handleDrinkWater}>Drink Water</button>
        </div>
      </div>
    </div>
  );
}
