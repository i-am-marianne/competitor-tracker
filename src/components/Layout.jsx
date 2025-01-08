import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UpdateStatusProvider } from '../contexts/UpdateStatusContext'; // Import the provider
import UpdateStatusBar from './UpdateStatusBar'; // Import the status bar

const Layout = () => {
  return (
    <UpdateStatusProvider> {/* Wrap the app in the provider */}
      <div>
        {/* Update Status Bar */}
        <UpdateStatusBar />

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
      </div>
    </UpdateStatusProvider>
  );
};

export default Layout;
