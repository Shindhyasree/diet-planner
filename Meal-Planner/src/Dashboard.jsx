import { useParams } from "react-router-dom";
import DietMealPlanner from "./DietMealPlanner"; // Import the DietMealPlanner component

export default function Dashboard() {
  const { email } = useParams(); // Extract email from the URL

  return (
    <div className="container py-4 diet-meal-planner-container">
      <h1>Welcome, {email}</h1> {/* Display the user's email */}
      <DietMealPlanner email={email}/> {/* Render the DietMealPlanner component */}
    </div>
  );
}
