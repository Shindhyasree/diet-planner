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
  const [selectedMeal, setSelectedMeal] = useState(null);

  const openModal = (meal) => setSelectedMeal(meal);
  const closeModal = () => setSelectedMeal(null);


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

      toast.success("You drank a glass of water! 🥤 Keep going..! ", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error updating water intake:", error);
      toast.error("Failed to update water intake", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="container py-4 mb-5">
      <h1 className="mb-3">Welcome, {username || "User"}</h1>
      <h2 className="text-xl font-bold text-center mb-4">Your Meal Plan</h2>
      {filteredMeals.length > 0 ? (
        <div className="row">
          {filteredMeals
            .slice()
            .sort((a, b) => {
              const orderA = mealOrder[a.category.toLowerCase()] || 4;
              const orderB = mealOrder[b.category.toLowerCase()] || 4;
              return orderA - orderB;
            })
            .map((meal, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div
                  className="card d-flex flex-row align-items-start shadow-sm p-3 bg-color food-item"
                  onClick={() => openModal(meal)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="image-container"
                    style={{
                      minWidth: "100px",
                      minHeight: "100px",
                      backgroundImage: `url(${meal.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      borderRadius: "8px",
                    }}
                  ></div>
                  <div className="card-body d-flex flex-column w-100 gap-2 p-3 py-1">
                    <h5 className="card-title mb-1 text-dark">{meal.name}</h5>
                    <p className="mb-0 text-secondary">
                      {meal.category.charAt(0).toUpperCase() + meal.category.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No meals found for your preferences.</p>
      )}
      <div className="card my-3 food-item">
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
      <div className="card mb-3 food-item">
        <div className="card-body">
          <h2 className="card-title">Water Intake</h2>
          <p>You have consumed {waterIntake} glasses of water today.</p>
          <button className="btn btn-primary" onClick={handleDrinkWater}>Sip Done!</button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      {selectedMeal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            className="modal-content bg-white rounded shadow p-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "550px",
              width: "95%",
              height: "65%",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3 className="mb-3">{selectedMeal.name}</h3>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${selectedMeal.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "10px",
                marginBottom: "1rem",
              }}
            ></div>
            <p><strong><i>{selectedMeal.description}</i></strong></p>
            <p><strong>Ingredients:</strong> {selectedMeal.ingredients.join(", ")}</p>
            <p><strong>Category:</strong> {selectedMeal.category}</p>
            <p><strong>Calories:</strong> {selectedMeal.calorie} kcal</p>
          </div>
        </div>
      )}
    </div>
  );
}