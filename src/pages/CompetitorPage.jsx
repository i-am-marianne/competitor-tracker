import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import "../styles/CompetitorPage.css";
import "../styles/ReleaseNotesTimeline.css";
import tags from "../utils/tags";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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

  // Add the new function here
  const processUpdatesByMonth = (releaseNotes) => {
    if (!Array.isArray(releaseNotes) || releaseNotes.length === 0) {
      return [];
    }

    //Add line chart with release frequency
    const countsByMonth = releaseNotes.reduce((acc, note) => {
      const date = new Date(note.date);
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(countsByMonth)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA - dateB; // This will sort from oldest to newest
      })
      .map(([month, count]) => ({
        month,
        updates: count,
      }));
  };

  //Add bar chart with tag count
  const processUpdatesByTags = (releaseNotes) => {
    if (!Array.isArray(releaseNotes) || releaseNotes.length === 0) {
      return [];
    }

    // Count updates by tag
    // Initialize counts for all available tags
    const tagCounts = Object.keys(tags).reduce((acc, tag) => {
      acc[tag] = 0;
      return acc;
    }, {});

    // Count updates by tag
    releaseNotes.forEach((note) => {
      const noteTags = addTagsToReleaseNote(note);
      noteTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
      }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
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
    if (!Array.isArray(releaseNotes) || releaseNotes.length === 0) {
      return {};
    }

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
        if (releaseNotesResponse.ok) {
          const releaseNotesData = await releaseNotesResponse.json();
          setReleaseNotes(releaseNotesData || []); // Ensure we always have an array

          // Move this inside the if block since we only want to process if we have data
          if (releaseNotesData && releaseNotesData.length > 0) {
            const latestRelease = releaseNotesData.reduce((latest, note) => {
              return new Date(note.date) > new Date(latest.date)
                ? note
                : latest;
            });
            setLatestReleaseNoteDate(latestRelease.date);
          } else {
            setLatestReleaseNoteDate(null);
          }
        } else {
          setReleaseNotes([]); // Set empty array if no release notes found
          setLatestReleaseNoteDate(null);
        }
      } catch (error) {
        console.error("Error fetching competitor details:", error);
        setReleaseNotes([]);
        setLatestReleaseNoteDate(null);
      }
    };

    fetchCompetitorDetails();
  }, [id]);

  if (!competitor) return <div>Loading...</div>;

  return (
    <div className="competitor-page" style={{ paddingBottom: "60px" }}>
      {/* Header with back button and basic info */}
      <div className="page-header">
        <div className="back-button" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <div className="basic-info">
          <div className="competitor-logo">
            <img
              src={competitor.logoUrl}
              alt={`${competitor.name} logo`}
              className="logo-image"
            />
          </div>
          <div className="competitor-name">{competitor.name}</div>
        </div>
      </div>

      {/* Top Row */}
      <div className="top-row">
        <div className="general-info-block">
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

        <div className="stats-block">
          <h4>Updates per month</h4>
          <div className="chart-container">
            <LineChart
              width={400}
              height={300}
              data={processUpdatesByMonth(releaseNotes)}
              margin={{ top: 10, right: 15, left: 0, bottom: 45 }}
            >
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11, fill: "#666" }}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#666" }}
                allowDecimals={false}
                label={{
                  value: "Updates",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "#000" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#666", fontWeight: 700, fontSize: 11 }}
                itemStyle={{ color: "#333", fontSize: 11}}
              />
              <Line
                type="monotone"
                dataKey="updates"
                stroke="#333"
                strokeWidth={2}
                dot={{ fill: "black", stroke: "#333", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#333" }}
              />
            </LineChart>
          </div>
        </div>
        <div className="stats-block">
          <h4>Updates by category</h4>
          <div className="chart-container">
            <BarChart
              width={400}
              height={400} // Increased height to fit all labels
              data={processUpdatesByTags(releaseNotes)}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 60, bottom: 5 }} // Adjusted left margin
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} />
              <YAxis
                type="category"
                dataKey="tag"
                width={30} // Adjusted width
                tick={{ fontSize: 11, fill: "#666" }}
                interval={0} // Show all labels
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#666", fontWeight: 700, fontSize: 11 }}
                itemStyle={{ color: "#333", fontSize: 11 }}
              />
              <Bar dataKey="count" fill="#333" radius={[0, 4, 4, 0]} />
            </BarChart>
          </div>
        </div>
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
          <p className="no-release-notes">No release notes available</p>
        )}
      </div>
    </div>
  );
};

export default CompetitorPage;
