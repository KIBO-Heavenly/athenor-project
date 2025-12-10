import React, { createContext, useState, useContext, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    // Default to light mode (false) if no preference is saved
    return saved ? JSON.parse(saved) : false;
  });

  const [disableEffects, setDisableEffects] = useState(() => {
    const saved = localStorage.getItem('disableEffects');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('disableEffects', JSON.stringify(disableEffects));
  }, [disableEffects]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleDisableEffects = () => {
    setDisableEffects(!disableEffects);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, disableEffects, toggleDisableEffects }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};
