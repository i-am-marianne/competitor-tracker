import React, { useEffect, useState } from 'react';
import prisma from '../lib/prisma';

const CompetitorsList = () => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/competitors');
        const data = await response.json();
        setCompetitors(data);
      } catch (error) {
        console.error('Error fetching competitors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitors();
  }, []);

  const getCountryFlag = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  if (loading) {
    return <div>Loading competitors...</div>;
  }

  return (
    <div className="competitors-grid">
      {competitors.map(competitor => (
        <div key={competitor.id} className="competitor-card">
          <div className="competitor-logo">
            {competitor.logoUrl ? (
              <img 
                src={competitor.logoUrl} 
                alt={`${competitor.name} logo`}
                className="logo-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ''; // Remove broken image
                  e.target.className = 'logo-placeholder';
                  e.target.alt = competitor.name[0];
                }}
              />
            ) : (
              <div className="logo-placeholder">{competitor.name[0]}</div>
            )}
          </div>
          <div className="competitor-info">
            <h3>{competitor.name}</h3>
            <div className="country-flag">
              {getCountryFlag(competitor.countryCode)}
            </div>
            <div className="last-update">
              Last update: {new Date(competitor.lastUpdateDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompetitorsList;