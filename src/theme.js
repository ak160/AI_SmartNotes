// src/theme.js
import { createTheme } from '@mui/material/styles';

// Shared palette overrides
const baseConfig = {
  typography: { /* your typography settings here */ },
};

export const lightTheme = createTheme({
  ...baseConfig,
  palette: { mode: 'light' },
});

export const darkTheme = createTheme({
  ...baseConfig,
  palette: { mode: 'dark' },
});
