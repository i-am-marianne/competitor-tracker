import React from 'react';
import { useUpdateStatus } from '../contexts/UpdateStatusContext'; // Use the context
import '../styles/UpdateStatusBar.css'; // Import the updated CSS

const UpdateStatusBar = () => {
  const { status, hideStatus } = useUpdateStatus(); // Access status and hide function

  if (!status.message) return null; // Don't render if no message

  return (
    <div className="status-widget">
      <div className="status-message">
        {status.message}
        {status.estimatedTime && (
          <span> <br></br> Will be completed around {status.estimatedTime}</span>
        )}
      </div>
      <button className="hide-button" onClick={hideStatus}>
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
};

export default UpdateStatusBar;
