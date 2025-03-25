import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './login';
import Dashboard from './Dashboard';
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
          <Route path="/Dashboard/:email" element={<Dashboard />} />
          <Route path="/Bmicalculator" element={<Bmicalculator />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <FooterMarquee />
      </div>
    </Router>
  );
}

export default App;
