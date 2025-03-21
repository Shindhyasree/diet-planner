import { useState, useEffect } from "react";
import axios from "axios";
import "./DietMealPlanner.css"

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
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get("http://localhost:5000/user-dashboard");
        // Assuming the API response contains data like this
        const { meals, groceryList, mealPlan, nutritionalInfo } = response.data;
        // Update state with the fetched data
        setMeals(meals);
        // setWaterIntake(waterResponse.data.waterIntake);
        setGroceryList(groceryList);
        setMealPlan(mealPlan);
        setNutritionalInfo(nutritionalInfo);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/waterIntake/${email}`);
        setWaterIntake(response.data.waterIntake);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [email]);

  const addMeal = () => {
    if (meal && calories) {
      setMeals([...meals, { meal, calories }]);
      setMeal("");
      setCalories("");
    }
  };

  const addGroceryItem = () => {
    if (groceryItem) {
      setGroceryList([...groceryList, groceryItem]);
      setGroceryItem("");
    }
  };

  const handleDrinkWater = async () => {
    try {
      // Make the API request to update the water intake
      await axios.put(`http://localhost:5000/updateWaterIntake/${email}`, {
        // Send the current water intake + 1 to the server
        waterIntake: waterIntake + 1,
        email: email,
      });
  
      // After updating, fetch the updated water intake from the server
      const response = await axios.get(`http://localhost:5000/waterIntake/${email}`);
      
      // Update the state with the new water intake
      setWaterIntake(response.data.waterIntake);
  
    } catch (error) {
      console.error("Error updating water intake:", error);
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
              <li key={index} className="list-group-item">{m.meal} - {m.calories} kcal</li>
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
