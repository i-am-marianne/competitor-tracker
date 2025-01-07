import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div>
          <h1>Competitor Tracker</h1>
          {/* Navigation */}
          <nav className="nav">
            <Link to="/competitors">Competitors</Link>
            <Link to="/features">Features</Link>
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