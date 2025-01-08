// CompetitorPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/CompetitorPage.css"; // Import the new CSS file

const CompetitorPage = () => {
  const [competitor, setCompetitor] = useState(null);
  const [lastReleaseNote, setLastReleaseNote] = useState(null);
  const [releaseSources, setReleaseSources] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch competitor details, release sources, and last release note
    const fetchCompetitorDetails = async () => {
      try {
        const competitorResponse = await fetch('http://localhost:3000/api/competitors/1'); // Replace with actual ID
        const competitorData = await competitorResponse.json();
        setCompetitor(competitorData);

        const releaseSourcesResponse = await fetch(`http://localhost:3000/api/competitors/${competitorData.id}/sources`);
        const releaseSourcesData = await releaseSourcesResponse.json();
        setReleaseSources(releaseSourcesData);

        const lastReleaseNoteResponse = await fetch(`http://localhost:3000/api/competitors/${competitorData.id}/last-release-note`);
        const lastReleaseNoteData = await lastReleaseNoteResponse.json();
        setLastReleaseNote(lastReleaseNoteData);
      } catch (error) {
        console.error('Error fetching competitor details:', error);
      }
    };

    fetchCompetitorDetails();
  }, []);

  const getCountryFlag = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  if (!competitor) return <div>Loading...</div>;

  return (
    <div className="competitor-page">
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate('/')}>
        <span className="material-symbols-outlined">arrow_back</span>
      </div>

      {/* Top Row */}
      <div className="top-row">
        {/* General Info Block */}
        <div className="general-info-block">
          <div className="competitor-info">
            <div className="competitor-logo">
              <img src={competitor.logoUrl} alt={`${competitor.name} logo`} className="logo-image" />
            </div>
            <div className="competitor-name">{competitor.name}</div>
          </div>
          <div className="release-sources">
            <h4>Release sources</h4>
            <div className="source-icons">
              {releaseSources.map((source, index) => (
                <img key={index} src={source.iconUrl} alt={source.type} className="source-icon" />
              ))}
            </div>
          </div>
          <div className="last-release-note">
            <h4>Last release note</h4>
            <p>{lastReleaseNote ? lastReleaseNote.date : 'No release notes available'}</p>
          </div>
        </div>

        {/* Empty Blocks (for now) */}
        <div className="empty-block"></div>
        <div className="empty-block"></div>
      </div>

      {/* Bottom Row - Full width block for Release Notes */}
      <div className="release-notes-block">
        <h3>Release notes</h3>
        {/* Placeholder for now */}
        <p>Release notes will appear here...</p>
      </div>
    </div>
  );
};

export default CompetitorPage;
