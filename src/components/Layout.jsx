import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

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
    </div>
  );
};

export default Layout;
