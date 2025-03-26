import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './login';
import DietMealPlanner from './DietMealPlanner';
import Signup from "./signUp";
import Bmicalculator from "./bmiCalculator";
import FooterMarquee from "./footer";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/Bmicalculator/:userId" element={<Bmicalculator />} />
          <Route path="/dietmealplanner/:userId" element={<DietMealPlanner />} />
        </Routes>
        <FooterMarquee />
      </div>
    </Router>
  );
}

export default App; 
