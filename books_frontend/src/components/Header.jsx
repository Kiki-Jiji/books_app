// books_frontend/src/components/Header.jsx
import React from 'react';
import '../App.css';

function Header() {
  return (
    <header className="kdp-header">
      <div className="header-content">
        <span className="kindle-logo">Becky</span>
        <span className="direct-publishing">direct publishing</span>
      </div>
    </header>
  );
}

export default Header;