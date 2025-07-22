import React from 'react';
import { Button, Tooltip } from '@mui/material'; // Import Tooltip
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { saveDoc } from '../services/storageService';

const UploadButton = ({ onUpload }) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const blob = new Blob([file], { type: file.type });
      try {
        await saveDoc({
          name: file.name,
          blob: blob,
          fileName: file.name,
          updatedAt: new Date().toISOString(),
        });
        if (onUpload) {
          onUpload();
        }
      } catch (err) {
        alert('Failed to save document: ' + err.message);
      }
    }
    event.target.value = null;
  };

  return (
    <Tooltip title="Upload PDF"> {/* Wrap the button with a Tooltip */}
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        fullWidth
      >
        
        <input
          type="file"
          hidden
          accept=".pdf"
          onChange={handleFileUpload}
        />
      </Button>
    </Tooltip>
  );
};

export default UploadButton;