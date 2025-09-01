// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './js/Login';  // Import your Login component
import SignUp from './js/SignUp'; // Import your SignUp component
import AppComponent  from './js/App';  // You can have a Home page or any other component
import './App.css';
const Application = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppComponent />} /> {/* Home page */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/signup" element={<SignUp />} /> {/* SignUp page */}
      </Routes>
    </Router>
  );
};

export default Application;
