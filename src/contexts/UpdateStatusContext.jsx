import React, { createContext, useState, useContext } from 'react';

// Create context
const UpdateStatusContext = createContext();

export const useUpdateStatus = () => {
  return useContext(UpdateStatusContext); // Use context to get the status
};

// Provider component
export const UpdateStatusProvider = ({ children }) => {
  const [status, setStatus] = useState({
    message: "",
    isUpdating: false,  // Ensure `isUpdating` is part of the status object
    estimatedTime: null,
    error: false,
  });

  const startUpdate = (estimatedTime) => {
    setStatus({
      message: "Updating...",
      isUpdating: true,  // Set `isUpdating` to true when update starts
      estimatedTime,
      error: false,
    });
  };

  const completeUpdate = () => {
    setStatus({
      message: "Update completed!",
      isUpdating: false,  // Set `isUpdating` to false when update completes
      estimatedTime: null,
      error: false,
    });
  };

  const failUpdate = (errorMessage) => {
    setStatus({
      message: errorMessage,
      isUpdating: false,  // Set `isUpdating` to false if update fails
      estimatedTime: null,
      error: true,
    });
  };

  const hideStatus = () => {
    setStatus({
      message: "",
      isUpdating: false,  // Reset status
      estimatedTime: null,
      error: false,
    });
  };

  return (
    <UpdateStatusContext.Provider
      value={{
        status,  // Provide the `status` object, including `isUpdating`
        startUpdate,
        completeUpdate,
        failUpdate,
        hideStatus,
      }}
    >
      {children}
    </UpdateStatusContext.Provider>
  );
};
