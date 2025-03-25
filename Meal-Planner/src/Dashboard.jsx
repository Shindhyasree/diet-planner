import { useParams } from "react-router-dom";
import DietMealPlanner from "./DietMealPlanner";

export default function Dashboard() {
  const { email } = useParams();
  return (
    <div className="container py-4 diet-meal-planner-container">
      <h1>Welcome, {email}</h1>
      <DietMealPlanner email={email}/>
    </div>
  );
}
