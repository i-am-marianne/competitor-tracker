import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CompetitorsList from './components/CompetitorsList';
import CompetitorPage from './pages/CompetitorPage'; // Import new page

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CompetitorsList />} />
        <Route path="/competitors" element={<CompetitorsList />} />
        <Route path="/competitors/:id" element={<CompetitorPage />} /> {/* New route */}
        <Route path="/features" element={<h1>Features Page</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
