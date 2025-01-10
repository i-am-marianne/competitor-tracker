import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import "../styles/CompetitorPage.css";
import "../styles/ReleaseNotesTimeline.css";
import tags from "../utils/tags";

const sourceIconMap = {
  website: faGlobe,
  telegram: faTelegram,
  other: "https://example.com/icons/default-icon.png",
};

const CompetitorPage = () => {
  // States
  const [competitor, setCompetitor] = useState(null);
  const [releaseSources, setReleaseSources] = useState([]);
  const [releaseNotes, setReleaseNotes] = useState([]);
  const [latestReleaseNoteDate, setLatestReleaseNoteDate] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTags, setSelectedTags] = useState(["All"]);
  const availableTags = ["All", ...Object.keys(tags)];

  // Utility functions
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };
  const highlightKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    return text.replace(
      regex,
      (match) => `<span class="highlight">${match}</span>`
    );
  };

  const addTagsToReleaseNote = (note) => {
    const tagsList = [];
    for (const [tag, keywords] of Object.entries(tags)) {
      const regex = new RegExp(keywords.join("|"), "i");
      if (regex.test(note.title) || regex.test(note.details)) {
        tagsList.push(tag);
      }
    }
    return tagsList;
  };

  const filterReleaseNotesByTags = (notes) => {
    if (selectedTags.includes("All")) {
      return notes;
    }
    return notes.filter((note) => {
      const noteTags = addTagsToReleaseNote(note);
      return selectedTags.some((selectedTag) => noteTags.includes(selectedTag));
    });
  };

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

  // Process notes
  const groupedReleaseNotes = groupReleaseNotesByDate(
    filterReleaseNotesByTags(releaseNotes)
  );

  // Effects
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

  if (!competitor) return <div>Loading...</div>;

  return (
    <div className="competitor-page" style={{ paddingBottom: "60px" }}>
      {/* Back Button */}
      <div className="back-button" onClick={() => navigate("/")}>
        <span className="material-symbols-outlined">arrow_back</span>
      </div>

      {/* Top Row */}
      <div className="top-row">
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

      <div className="release-notes-block">
        <h3>Release notes</h3>
        <div className="filter-tabs-container">
          <div className="filter-tabs">
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`filter-tab ${
                  selectedTags.includes(tag) ? "active" : ""
                }`}
                onClick={() => {
                  if (tag === "All") {
                    setSelectedTags(["All"]);
                  } else {
                    const newSelectedTags = selectedTags.includes("All")
                      ? [tag]
                      : selectedTags.includes(tag)
                      ? selectedTags.filter((t) => t !== tag)
                      : [...selectedTags, tag];
                    setSelectedTags(
                      newSelectedTags.length ? newSelectedTags : ["All"]
                    );
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {Object.keys(groupedReleaseNotes).length > 0 ? (
          <div className="timeline">
            {Object.keys(groupedReleaseNotes).map((date, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">
                  <p>{date}</p>
                </div>
                <div className="timeline-line"></div>
                <div className="timeline-content">
                  {groupedReleaseNotes[date].map((note, noteIndex) => {
                    const tagsForNote = addTagsToReleaseNote(note);
                    return (
                      <div key={noteIndex} className="note-container">
                        <div className="note-header">
                          <h5
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(
                                note.title,
                                selectedTags.flatMap((tag) => tags[tag] || [])
                              ),
                            }}
                          ></h5>
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
                        <p
                          dangerouslySetInnerHTML={{
                            __html: highlightKeywords(
                              note.details,
                              selectedTags.flatMap((tag) => tags[tag] || [])
                            ),
                          }}
                        ></p>
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
