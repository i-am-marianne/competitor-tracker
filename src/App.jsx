import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CompetitorsList from './components/CompetitorsList';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/competitors" element={<CompetitorsList />} />
        <Route path="/features" element={<div>Features page</div>} />
        <Route path="/" element={<CompetitorsList />} /> {/* Using the same component for home */}
      </Route>
    </Routes>
  );
}

export default App;