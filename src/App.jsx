import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import Header from './components/Header';
import LayoutGrid from './components/LayoutGrid';
import { lightTheme, darkTheme } from './theme';
import { DocProvider } from './context/DocProvider';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatPanelRef = useRef(null);

  // This is the new state to control the layout: 'both' or 'notes'
  const [layoutMode, setLayoutMode] = useState('both'); 

  useEffect(() => {
    const stored = localStorage.getItem('dvDarkMode');
    if (stored === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('dvDarkMode', darkMode);
  }, [darkMode]);

  const appliedTheme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const handleChatToggle = useCallback(() => {
    setIsChatOpen(open => !open);
  }, []);

  const startAIConversation = useCallback((prompt) => {
    setIsChatOpen(true);
    setTimeout(() => {
      if (chatPanelRef.current) {
        chatPanelRef.current.startConversation(prompt);
      }
    }, 100);
  }, []);
  
  const handleInsertIntoNotes = useCallback((text) => {
    console.log("AI suggested content to insert into notes:", text);
  }, []);

  return (
    <DocProvider>
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header
            onMenuClick={() => setSidebarOpen(o => !o)}
            darkMode={darkMode}
            onThemeToggle={() => setDarkMode(d => !d)}
            onChatToggle={handleChatToggle}
            isChatOpen={isChatOpen}
          />
          <Box sx={{ flex: 1, position: 'relative', mt: 8 }}>
            <LayoutGrid
              sidebarOpen={sidebarOpen}
              isChatOpen={isChatOpen}
              startAIConversation={startAIConversation}
              chatPanelRef={chatPanelRef}
              onInsertIntoNotes={handleInsertIntoNotes}
              
              // Pass the new layout mode state and its setter
              layoutMode={layoutMode} 
              setLayoutMode={setLayoutMode}
            />
          </Box>
        </Box>
      </ThemeProvider>
    </DocProvider>
  );
}