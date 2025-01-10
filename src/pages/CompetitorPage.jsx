import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons"; // Import Telegram from brands
import { faGlobe } from "@fortawesome/free-solid-svg-icons"; // Import Globe from solid icons
import "../styles/CompetitorPage.css"; // Import the new CSS file
import "../styles/ReleaseNotesTimeline.css"; // Import the new CSS for Release Notes
import tags from "../utils/tags"; // Import the tags.js file

// Mapping of source types to Font Awesome icons
const sourceIconMap = {
  website: faGlobe, // FontAwesome Globe Icon for Website
  telegram: faTelegram, // FontAwesome Telegram Icon
  other: "https://example.com/icons/default-icon.png", // Fallback for unknown types
};

const CompetitorPage = () => {
  const [competitor, setCompetitor] = useState(null);
  const [releaseSources, setReleaseSources] = useState([]);
  const [releaseNotes, setReleaseNotes] = useState([]); // New state for release notes
  const [latestReleaseNoteDate, setLatestReleaseNoteDate] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchCompetitorDetails = async () => {
      try {
        const competitorResponse = await fetch(
          `http://localhost:3000/api/competitors/${id}`
        );
        const competitorData = await competitorResponse.json();
        setCompetitor(competitorData);

        const releaseSourcesResponse = await fetch(
          `http://localhost:3000/api/competitors/${competitorData.id}/sources`
        );
        const releaseSourcesData = await releaseSourcesResponse.json();
        setReleaseSources(releaseSourcesData);

        const releaseNotesResponse = await fetch(
          `http://localhost:3000/api/competitors/${competitorData.id}/release-notes`
        );
        const releaseNotesData = await releaseNotesResponse.json();
        setReleaseNotes(releaseNotesData);

        if (releaseNotesData && releaseNotesData.length > 0) {
          const latestRelease = releaseNotesData.reduce((latest, note) => {
            return new Date(note.date) > new Date(latest.date) ? note : latest;
          });
          setLatestReleaseNoteDate(latestRelease.date);
        } else {
          setLatestReleaseNoteDate(null);
        }
      } catch (error) {
        console.error("Error fetching competitor details:", error);
      }
    };

    fetchCompetitorDetails();
  }, [id]);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  // Function to group release notes by date
  const groupReleaseNotesByDate = (releaseNotes) => {
    const groupedNotes = releaseNotes.reduce((groups, note) => {
      const date = formatDate(note.date);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {});

    return groupedNotes;
  };

  // Group the release notes by date
  const groupedReleaseNotes = groupReleaseNotesByDate(releaseNotes);

  // Function to add tags based on the keywords in the release note's title/details
  const addTagsToReleaseNote = (note) => {
    const tagsList = [];

    // Loop through each tag category and check if any keyword matches the title or details
    for (const [tag, keywords] of Object.entries(tags)) {
      const regex = new RegExp(keywords.join("|"), "i"); // Create a case-insensitive regex from the keywords

      // If a keyword match is found in title or details, add the tag to the tagsList
      if (regex.test(note.title) || regex.test(note.details)) {
        tagsList.push(tag);
      }
    }

    return tagsList;
  };

  if (!competitor) return <div>Loading...</div>;

  return (
    <div className="competitor-page" style={{ paddingBottom: "60px" }}>
      {" "}
      {/* Add padding for floating widget */}
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/")}>
        <span className="material-symbols-outlined">arrow_back</span>
      </div>
      {/* Top Row */}
      <div className="top-row">
        {/* General Info Block */}
        <div className="general-info-block">
          <div className="competitor-info">
            <div className="competitor-logo">
              <img
                src={competitor.logoUrl}
                alt={`${competitor.name} logo`}
                className="logo-image"
              />
            </div>
            <div className="competitor-name">{competitor.name}</div>
          </div>
          <div className="release-sources">
            <h4>Release sources</h4>
            {releaseSources.length > 0 ? (
              <div className="source-icons">
                {releaseSources.map((source, index) => {
                  const icon =
                    sourceIconMap[source.type] || sourceIconMap.other;
                  return (
                    <div key={index} className="source-icon-container">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {typeof icon === "string" ? (
                          <img
                            src={icon}
                            alt={source.type}
                            className="source-icon"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={icon}
                            className="source-icon"
                          />
                        )}
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-release-text">No release sources available</p>
            )}
          </div>
          <div className="last-release-note">
            <h4>Last release note</h4>
            <p>
              {latestReleaseNoteDate
                ? formatDate(latestReleaseNoteDate)
                : "No release notes available"}
            </p>
          </div>
        </div>

        <div className="empty-block"></div>
        <div className="empty-block"></div>
      </div>
      {/* Bottom Row - Full width block for Release Notes */}
      <div className="release-notes-block">
        <h3>Release notes</h3>
        {/* Display the grouped release notes in a vertical timeline */}
        {Object.keys(groupedReleaseNotes).length > 0 ? (
          <div className="timeline">
            {Object.keys(groupedReleaseNotes).map((date, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  <p>{date}</p>
                </div>
                <div className="timeline-line"></div>{" "}
                {/* Add the vertical line */}
                <div className="timeline-content">
                  {groupedReleaseNotes[date].map((note, noteIndex) => {
                    const tagsForNote = addTagsToReleaseNote(note);
                    return (
                      <div key={noteIndex} className="note-container">
                        <div className="note-header">
                          <h5>{note.title}</h5>
                          {tagsForNote.length > 0 && (
                            <div className="release-tags">
                              {tagsForNote.map((tag, idx) => (
                                <span key={idx} className="release-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p>{note.details}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No release notes available</p>
        )}
      </div>
    </div>
  );
};

export default CompetitorPage;
