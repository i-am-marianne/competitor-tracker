import React from 'react';
import { useUpdateStatus } from '../contexts/UpdateStatusContext'; // Use the context
import '../styles/UpdateStatusBar.css'; // Import the CSS for styling

const UpdateStatusBar = () => {
  const { status, hideStatus } = useUpdateStatus(); // Access status and hide function

  if (!status.message) return null; // Don't render if no message

  return (
    <div className={`status-bar ${status.isUpdating ? 'in-progress' : status.error ? 'error' : 'success'}`}>
      <div className="status-message">
        {status.message}
        {status.estimatedTime && (
          <span> - Estimated completion: {status.estimatedTime}</span>
        )}
      </div>
      <button onClick={hideStatus} className="hide-button">Hide</button>
    </div>
  );
};

export default UpdateStatusBar;