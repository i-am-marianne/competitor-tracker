import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UpdateStatusProvider } from '../contexts/UpdateStatusContext'; // Import the provider
import UpdateStatusBar from './UpdateStatusBar'; // Ensure it's imported correctly

const Layout = () => {
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div>
          <h1>Competitor Tracker</h1>
          {/* Navigation */}
          <nav className="nav">
            <NavLink 
              to="/competitors" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Competitors
            </NavLink>
            <NavLink 
              to="/features" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Features
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Floating Update Status Widget - Now at the bottom */}
      <UpdateStatusBar /> {/* Display the status widget on every page */}
    </div>
  );
};

export default Layout;
