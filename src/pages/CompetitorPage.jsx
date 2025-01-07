import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CompetitorPage = () => {
  const { id } = useParams(); // Get competitor ID from URL
  const navigate = useNavigate(); // Hook for navigation
  const [competitor, setCompetitor] = useState(null); // State for competitor data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitor = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/competitors/${id}`);
        const data = await response.json();
        setCompetitor(data);
      } catch (error) {
        console.error('Error fetching competitor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitor();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!competitor) {
    return <div>Competitor not found.</div>;
  }

  return (
    <div className="main-content">
      <div className="competitor-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Back Button */}
        <button 
          className="back-button" 
          onClick={() => navigate('/competitors')} // Navigate back to list
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        {/* Competitor Name */}
        <h1 className="competitor-name" style={{ margin: '0', fontSize: '24px', fontWeight: '600', lineHeight: '1' }}>
          {competitor.name}
        </h1>
      </div>

      <p>Details about this competitor will go here.</p>
    </div>
  );
};

export default CompetitorPage;