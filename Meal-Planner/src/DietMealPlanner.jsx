import { useState, useEffect } from "react";
import axios from "axios";
import "./DietMealPlanner.css";

export default function DietMealPlanner({email}) {
  // State variables for meal, calories, etc.
  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");
  const [meals, setMeals] = useState([]);
  const [waterIntake, setWaterIntake] = useState(0);  // Track water intake
  const [groceryItem, setGroceryItem] = useState("");
  const [groceryList, setGroceryList] = useState([]);
  const [mealPlan, setMealPlan] = useState("");
  const [nutritionalInfo, setNutritionalInfo] = useState("");

  // Fetch data from the API
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
  }, [email]); // Refetch when email changes

  // Fetch data when component mounts
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


  // ✅ Add a meal & log it to the backend
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


  // ✅ Update water intake in backend
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

  // ✅ Add grocery items (Client-side only for now)
  const addGroceryItem = () => {
    if (groceryItem) {
      setGroceryList([...groceryList, groceryItem]);
      setGroceryItem("");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Diet Meal Planner</h1>

      {/* Meal Tracking */}
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

      {/* Water Intake Reminder */}
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">Water Intake</h2>
          <p>You have consumed {waterIntake} glasses of water today.</p>
          <button className="btn btn-primary" onClick={handleDrinkWater}>Drink Water</button>
        </div>
      </div>

      {/* Grocery List */}
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">Grocery List</h2>
          <div className="d-flex gap-2 mt-2">
            <input
              className="form-control"
              placeholder="Grocery Item"
              value={groceryItem}
              onChange={(e) => setGroceryItem(e.target.value)}
            />
            <button className="btn btn-primary" onClick={addGroceryItem}>Add</button>
          </div>
          <ul className="mt-3 list-group">
            {groceryList.map((item, index) => (
              <li key={index} className="list-group-item">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Meal Planning */}
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="card-title">Meal Planning</h2>
          <textarea
            className="form-control mt-2"
            placeholder="Plan your meals for the week..."
            value={mealPlan}
            onChange={(e) => setMealPlan(e.target.value)}
          />
        </div>
      </div>

      {/* Nutritional Analysis */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Nutritional Analysis</h2>
          <textarea
            className="form-control mt-2"
            placeholder="Enter meal details to analyze nutrition..."
            value={nutritionalInfo}
            onChange={(e) => setNutritionalInfo(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
