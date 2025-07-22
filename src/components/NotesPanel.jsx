// src/components/NotesPanel.jsx
import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill'; 
import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/github.css';

import { Box, Typography, Button } from '@mui/material';
import { useDoc } from '../context/useDoc';
import { getNote, saveNote } from '../services/noteService';
import NotesToolbar from './NotesToolbar';
import { jsPDF } from 'jspdf'; 

// Make NotesPanel a forwardRef component
const NotesPanel = forwardRef((props, ref) => { // Removed setLayoutMode from here
  const { selectedDoc } = useDoc();
  const debounceTimeoutRef = useRef(null);

  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: {
        container: '#toolbar',
      },
      syntax: false, 
    },
    formats: [
      'header', 'bold', 'italic', 'underline', 'strike',
      'color', 'background', 'list', 'indent', 'blockquote', 'code-block',
      'code' 
    ]
  });

  // Expose a public method to the parent component
  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      if (quill) {
        const range = quill.getSelection();
        const cursorPosition = range ? range.index : 0;
        quill.insertText(cursorPosition, text + '\n');
        quill.setSelection(cursorPosition + text.length + 1); // Move cursor to the end
      }
    }
  }));

  useEffect(() => {
    if (quill && selectedDoc) {
      quill.setText('');
      getNote(selectedDoc.id)
        .then((content) => {
          quill.clipboard.dangerouslyPasteHTML(content || '');
        })
        .catch(error => {
          console.error("Error loading note:", error);
        });
    } else if (quill && !selectedDoc) {
      quill.setText('');
    }
    return () => {
      if (quill) {
        quill.setText('');
      }
    };
  }, [quill, selectedDoc]);

  useEffect(() => {
    if (!quill || !selectedDoc) return;
    const saveDebounced = (html) => {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        saveNote(selectedDoc.id, html).catch(error => {
          console.error("Error saving note:", error);
        });
      }, 800);
    };
    const changeHandler = (delta, oldDelta, source) => {
      if (source === 'user') {
        saveDebounced(quill.root.innerHTML);
      }
    };
    quill.on('text-change', changeHandler);
    return () => {
      quill.off('text-change', changeHandler);
      clearTimeout(debounceTimeoutRef.current);
    };
  }, [quill, selectedDoc]);

  const handleSave = useCallback(() => {
    if (quill && selectedDoc) {
      saveNote(selectedDoc.id, quill.root.innerHTML)
        .then(() => console.log('Note saved successfully!'))
        .catch(error => {
          console.error('Error saving note manually:', error);
        });
    }
  }, [quill, selectedDoc]);

  const handleExportPDF = () => {
    if (!quill || !selectedDoc) return;
    const element = document.querySelector('.notes-area');
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

    doc.html(element, {
      callback: () => {
        doc.save(`${selectedDoc.name}-notes.pdf`);
      },
      x: 20,
      y: 20,
      html2canvas: { scale: 2 },
    });
  };

  if (!selectedDoc) {
    return (
      <Box sx={{ p: 2, border: theme => `1px solid ${theme.palette.divider}`, backgroundColor: 'inherit', color: 'inherit' }}>
        <Typography color="textSecondary">Select a document to take notes.</Typography>
      </Box>
    );
  }

  return (
    <Box className="notes-area" sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 2, border: theme => `1px solid ${theme.palette.divider}`, backgroundColor: 'inherit', color: 'inherit' }}>
      <NotesToolbar />
      <Box sx={{ p: 1, border: theme => `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'inherit', color: 'inherit' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Notes for: {selectedDoc.name}</Typography>
        <Button size="small" variant="outlined" onClick={handleSave} disabled={!quill}>Save</Button>
        <Button size="small" variant="contained" onClick={handleExportPDF} disabled={!quill}>
          PDF
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, p: 1, overflow: 'auto', backgroundColor: 'inherit', color: 'inherit', border: theme => `1px solid ${theme.palette.divider}` }}>
        <div ref={quillRef} style={{ height: '100%' }} />
      </Box>
    </Box>
  );
});

export default NotesPanel;