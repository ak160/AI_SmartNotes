// src/components/SelectionActions.jsx
import React from 'react';
import { Box, Button } from '@mui/material';

// We now accept a new prop: `onAskAI`
const SelectionActions = ({ x, y, onExplain, onSummarize, onKeyPoints, onHighlight, onUnderline, onAskAI, disabled }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: y,
        left: x,
        bgcolor: 'background.paper',
        boxShadow: 3,
        p: 1,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000,
        transform: 'translateY(-100%)',
        whiteSpace: 'nowrap',
      }}
    >
      {/* New: Ask AI button */}
      <Button variant="contained" size="small" onClick={onAskAI} disabled={disabled}>
        Ask AI
      </Button>
      <Button variant="outlined" size="small" onClick={onExplain} disabled={disabled}>
        Explain (AI)
      </Button>
      <Button variant="outlined" size="small" onClick={onSummarize} disabled={disabled}>
        Summarize (AI)
      </Button>
      <Button variant="outlined" size="small" onClick={onKeyPoints} disabled={disabled}>
        Key Points (AI)
      </Button>
      <Button variant="outlined" size="small" onClick={onHighlight} disabled={disabled}>
        Highlight
      </Button>
      <Button variant="outlined" size="small" onClick={onUnderline} disabled={disabled}>
        Underline
      </Button>
    </Box>
  );
};

export default SelectionActions;