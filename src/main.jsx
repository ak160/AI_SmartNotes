// src/main.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DocProvider } from './context/DocProvider';
import './quillSetup'; // side-effects only

function Root() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('dvDarkMode') === 'true') setDarkMode(true);
  }, []);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DocProvider>
          <App
            darkMode={darkMode}
            onThemeToggle={() => {
              setDarkMode(prev => {
                localStorage.setItem('dvDarkMode', String(!prev));
                return !prev;
              });
            }}
          />
        </DocProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<Root />);
export default Root; // <-- only React component is exported
