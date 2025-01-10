import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons'; // Import Telegram from brands
import { faGlobe } from '@fortawesome/free-solid-svg-icons'; // Import Globe from solid icons
import "../styles/CompetitorPage.css"; // Import the new CSS file

// Mapping of source types to Font Awesome icons
const sourceIconMap = {
  website: faGlobe,  // FontAwesome Globe Icon for Website
  telegram: faTelegram,  // FontAwesome Telegram Icon
  other: "https://example.com/icons/default-icon.png", // Fallback for unknown types
};

const CompetitorPage = () => {
  const [competitor, setCompetitor] = useState(null);
  const [lastReleaseNote, setLastReleaseNote] = useState(null);
  const [releaseSources, setReleaseSources] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();  // Get the competitor ID from the URL

  useEffect(() => {
    const fetchCompetitorDetails = async () => {
      try {
        const competitorResponse = await fetch(`http://localhost:3000/api/competitors/${id}`); // Use the dynamic ID
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
  }, [id]);  // The effect runs again if `id` changes

  const getCountryFlag = (countryCode) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  if (!competitor) return <div>Loading...</div>;

  return (
    <div className="competitor-page" style={{ paddingBottom: '60px' }}> {/* Add padding for floating widget */}
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
              {releaseSources.map((source, index) => {
                // Use the source type to get the correct icon
                const icon = sourceIconMap[source.type] || sourceIconMap.other; // Fallback if type is not found
                return (
                  <div key={index} className="source-icon-container">
                    {/* Make the icon clickable, using the URL from the source */}
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {typeof icon === "string" ? (
                        <img src={icon} alt={source.type} className="source-icon" />
                      ) : (
                        <FontAwesomeIcon icon={icon} className="source-icon" />
                      )}
                    </a>
                  </div>
                );
              })}
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
