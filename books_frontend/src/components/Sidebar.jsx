// books_frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const MonitorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const ChevronUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function Sidebar() {
  const location = useLocation();
  const [booksOpen, setBooksOpen] = useState(true);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link to="/" className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`}>
          <GridIcon />
          <span>Dashboard</span>
        </Link>

        <div className="sidebar-group">
          <button className="sidebar-group-header" onClick={() => setBooksOpen(!booksOpen)}>
            <MonitorIcon />
            <span className="sidebar-group-label">Books</span>
            {booksOpen ? <ChevronUp /> : <ChevronDown />}
          </button>

          {booksOpen && (
            <div className="sidebar-group-items">
              <Link to="/" className={`sidebar-subitem ${location.pathname === '/' ? 'active' : ''}`}>
                Overview
              </Link>
              <Link to="/weekly" className={`sidebar-subitem ${location.pathname === '/weekly' ? 'active' : ''}`}>
                Weekly
              </Link>
              <Link to="/analytics" className={`sidebar-subitem ${location.pathname === '/analytics' ? 'active' : ''}`}>
                Ad Spend
              </Link>
            </div>
          )}
        </div>

        <Link to="/config" className={`sidebar-item ${location.pathname === '/config' ? 'active' : ''}`}>
          <SettingsIcon />
          <span>Config</span>
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;