import React, { createContext, useContext, useState } from 'react';

// Create the context
const UpdateStatusContext = createContext();

// Custom hook for using the context
export const useUpdateStatus = () => useContext(UpdateStatusContext);

// Provider component
export const UpdateStatusProvider = ({ children }) => {
  const [status, setStatus] = useState({
    isUpdating: false,
    message: '',
    error: null,
    estimatedTime: null,
  });

  const startUpdate = (estimatedTime) => {
    setStatus({
      isUpdating: true,
      message: 'Update in progress...',
      error: null,
      estimatedTime,
    });
  };

  const completeUpdate = () => {
    setStatus({
      isUpdating: false,
      message: 'Update completed successfully!',
      error: null,
      estimatedTime: null,
    });
  };

  const failUpdate = (error) => {
    setStatus({
      isUpdating: false,
      message: 'Update failed.',
      error: error || 'Unknown error',
      estimatedTime: null,
    });
  };

  const hideStatus = () => {
    setStatus({
      isUpdating: false,
      message: '',
      error: null,
      estimatedTime: null,
    });
  };

  return (
    <UpdateStatusContext.Provider
      value={{ status, startUpdate, completeUpdate, failUpdate, hideStatus }}
    >
      {children}
    </UpdateStatusContext.Provider>
  );
};
