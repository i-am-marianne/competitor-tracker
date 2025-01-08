import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompetitorsList = () => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // State for filter
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/competitors');
        if (!response.ok) throw new Error('Failed to fetch competitors');
        const data = await response.json();
        setCompetitors(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        setError(error.message);
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

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  // Filter logic based on tab
  const filteredCompetitors = competitors.filter(competitor => {
    if (filter === 'All') return true;
    if (filter === 'Russian') return competitor.countryCode === 'RU';
    if (filter === 'Foreign') return competitor.countryCode !== 'RU';
    return true;
  });

  if (loading) {
    return <div>Loading competitors...</div>;
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="filter-tabs">
        <div
          className={`filter-tab ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          All
        </div>
        <div
          className={`filter-tab ${filter === 'Russian' ? 'active' : ''}`}
          onClick={() => setFilter('Russian')}
        >
          Russian
        </div>
        <div
          className={`filter-tab ${filter === 'Foreign' ? 'active' : ''}`}
          onClick={() => setFilter('Foreign')}
        >
          Foreign
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="competitors-grid">
        {filteredCompetitors.map(competitor => (
          <div 
            key={competitor.id} 
            className="competitor-card"
            onClick={() => navigate(`/competitors/${competitor.id}`)} // Navigate on click
          >
            <div className="competitor-card-top">
              <div className="last-update">
                {formatDate(competitor.lastUpdateDate)}
              </div>
            </div>
            <div className="competitor-card-bottom">
              <div className="competitor-logo">
                {competitor.logoUrl ? (
                  <img 
                    src={competitor.logoUrl} 
                    alt={`${competitor.name} logo`}
                    className="logo-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
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
              </div>
              <div className="country-flag">
                {getCountryFlag(competitor.countryCode)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorsList;
