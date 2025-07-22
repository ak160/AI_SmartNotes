// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ForumIcon from '@mui/icons-material/Forum'; // New import for the chat icon
import { useTheme } from '@mui/material/styles';

const Header = ({ onMenuClick, darkMode, onThemeToggle, onChatToggle, isChatOpen }) => {
  const theme = useTheme();

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 ,color: 'inherit'}}>
          AI SmartNotes
        </Typography>

        {/* New: Chat Panel Toggle Button */}
        <Tooltip title={`${isChatOpen ? 'Close' : 'Open'} AI Chat`}>
          <IconButton color="inherit" onClick={onChatToggle}>
            <ForumIcon />
          </IconButton>
        </Tooltip>

        <IconButton color="inherit" onClick={onThemeToggle}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;