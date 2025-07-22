import React from 'react';
import { Button, Tooltip } from '@mui/material'; // Import Tooltip
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { clearAllDocs } from '../services/storageService';

const ClearDataButton = () => {
  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all documents? This cannot be undone.')) {
      try {
        await clearAllDocs();
        window.location.reload(); 
      } catch (err) {
        alert('Failed to clear data: ' + err.message);
      }
    }
  };

  return (
    <Tooltip title="Clear All Data"> 
      <Button
        variant="outlined"
        color="error"
        onClick={handleClearData}
        startIcon={<ClearAllIcon />}
        fullWidth
      >
      </Button>
    </Tooltip>
  );
};

export default ClearDataButton;