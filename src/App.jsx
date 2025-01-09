import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CompetitorsList from './components/CompetitorsList';
import CompetitorPage from './pages/CompetitorPage'; // Import new page
import { UpdateStatusProvider } from './contexts/UpdateStatusContext'; // Import UpdateStatusProvider
import UpdateStatusBar from './components/UpdateStatusBar'; // Import status bar component

function App() {
  return (
    <UpdateStatusProvider>
      {/* Layout */}
      <Layout />
      {/* Floating Update Status Widget - Now at the bottom */}
      <UpdateStatusBar /> 
      <Routes>
        <Route path="/" element={<CompetitorsList />} />
        <Route path="/competitors" element={<CompetitorsList />} />
        <Route path="/competitors/:id" element={<CompetitorPage />} />
        <Route path="/features" element={<h1>Features Page</h1>} />
      </Routes>
    </UpdateStatusProvider>
  );
}

export default App;
