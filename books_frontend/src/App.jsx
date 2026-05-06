// books_frontend/src/App.jsx
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage'; // Import the new DashboardPage component
import Weekly from './components/Weekly';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="app-container">
        <Header />

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/weekly" element={<Weekly />} />
          {/* Add more routes for other pages here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;