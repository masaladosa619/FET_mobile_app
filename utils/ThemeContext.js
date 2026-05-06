import React, { createContext, useState, useContext, useEffect } from 'react';
import { THEMES } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('dark'); // Default to dark as requested earlier

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const theme = THEMES[themeMode];

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
