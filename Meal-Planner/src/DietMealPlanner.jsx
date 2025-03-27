import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import "./DietMealPlanner.css";
import mealsData from "../../meals.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DietMealPlanner() {
  const { userId } = useParams();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);
  const [userPreferences, setUserPreferences] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const preferences = searchParams.get("preferences")?.split(",") || [];
    setUserPreferences(preferences);
    const matchedMeals = mealsData.filter(meal =>
      meal.preferences.some(pref => preferences.includes(pref))
    );
    setFilteredMeals(matchedMeals);
  }, [location.search]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${userId}`);
        setUsername(response.data.name);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, [userId]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/mealLogs/${userId}`);
        setMeals(response.data.mealLogs);
      } catch (error) {
        console.error("Error fetching meal logs: ", error);
      }
    };
    fetchMeals();
  }, [userId]);

  useEffect(() => {
    const fetchWaterIntake = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/waterIntake/${userId}`);
        setWaterIntake(response.data.waterIntake);
      } catch (error) {
        console.error("Error fetching water intake: ", error);
      }
    };
    fetchWaterIntake();
  }, [userId]);

  const addMeal = async () => {
    if (!meal || !calories) return;
    const newMeal = { itemName: meal, calories };
    try {
      const response = await axios.post(`http://localhost:5000/logMeal/${userId}`, {
        userId,
        meal: newMeal,
      });
      setMeals(response.data.mealLogs);
      setMeal("");
      setCalories("");
      toast.info(response.data.alert || "Meal logged successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error logging meal: ", error);
    }
  };

  const handleDrinkWater = async () => {
    try {
      await axios.put(`http://localhost:5000/updateWaterIntake/${userId}`, {
        waterIntake: waterIntake + 1,
      });
      const response = await axios.get(`http://localhost:5000/waterIntake/${userId}`);
      setWaterIntake(response.data.waterIntake);
    } catch (error) {
      console.error("Error updating water intake:", error);
    }
  };

  return (
    <div className="container py-4">
      <h1>Welcome, {username || "User"}</h1>
      <h1 className="mb-4">Diet Meal Planner</h1>
      <h2 className="text-xl font-bold text-center mb-4">Your Meal Plan</h2>
      {filteredMeals.length > 0 ? (
        filteredMeals
          .slice()
          .sort((a, b) => {
            const orderA = mealOrder[a.category.toLowerCase()] || 4;
            const orderB = mealOrder[b.category.toLowerCase()] || 4;
            return orderA - orderB;
          })
          .map((meal, index) => (
            <div key={index} className="p-3 mb-2 d-flex justify-content-between align-items-center">
              <div>
                <p className="m-0 g-0">{meal.name}</p>
                <p className="m-0 g-0"><strong>Ingredients:</strong> {meal.ingredients.join(", ")}</p>
              </div>
              <div className="d-flex flex-column align-items-end">
                <p className="m-0 g-0">Category: {meal.category}</p>
                <p className="m-0 g-0"><strong>Calorie:</strong> {meal.calorie}</p>
              </div>
            </div>
          ))
      ) : (
        <p className="text-center text-gray-500">No meals found for your preferences.</p>
      )}

      <div className="card my-3">
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
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
}