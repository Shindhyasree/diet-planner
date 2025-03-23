import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './login'; // Import your login component
import Dashboard from './Dashboard'; // Import the Dashboard component
import Signup from "./signUp"; // Import the Sign up component

function App() {
  return (
    <Router>
      <Routes>
        {/* Route to LoginPage */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Route to Dashboard, with email as a dynamic parameter */}
        <Route path="/Dashboard/:email" element={<Dashboard />} />
        
        {/* Route to Sign up*/}
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
