// books_frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/weekly">Weekly</Link></li>
        {/* Add more links for other pages here */}
      </ul>
    </div>
  );
}

export default Sidebar;