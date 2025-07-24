// src/components/DocumentViewer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDoc } from '../context/useDoc';
import { saveDoc } from '../services/storageService'; 
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PanToolIcon from '@mui/icons-material/PanTool';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import CloseIcon from '@mui/icons-material/Close';

import SelectionActions from './SelectionActions';
import PdfAnnotationLayer from './PdfAnnotationLayer';
import { useAI } from '../hooks/useAI';

import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

const DocumentViewer = ({ startAIConversation }) => {
  const { selectedDoc, setSelectedDoc } = useDoc();

  const [pdfSource, setPdfSource] = useState(null);
  const scrollableRef = useRef(null);

  const [selectionActions, setSelectionActions] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const fixedPageWidth = 800;

  const [annotations, setAnnotations] = useState(selectedDoc?.annotations || []);
  const pageContainerRefs = useRef([]);
  const saveTimeoutRef = useRef(null);

  const { loading: aiLoading } = useAI();
  const [isEraserMode, setIsEraserMode] = useState(false);

  useEffect(() => {
    setAnnotations(selectedDoc?.annotations || []);
  }, [selectedDoc]);

  useEffect(() => {
    if (selectedDoc?.id) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const updatedDoc = { ...selectedDoc, annotations };
          await saveDoc(updatedDoc);
          console.log('Annotations saved to IndexedDB.');
        } catch (error) {
          console.error('Failed to save annotations:', error);
        }
      }, 500);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [annotations, selectedDoc]);

  useEffect(() => {
    if (pageContainerRefs.current[currentPage - 1]) {
      pageContainerRefs.current[currentPage - 1].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [currentPage]);

  useEffect(() => {
    let cleanupUrl = null;
    if (!selectedDoc) {
      setPdfSource(null);
      return;
    }

    if (selectedDoc.blob) {
      cleanupUrl = URL.createObjectURL(selectedDoc.blob);
      setPdfSource(cleanupUrl);
    } else if (selectedDoc.file) {
      setPdfSource(selectedDoc.file);
    } else if (selectedDoc.url) {
      setPdfSource(selectedDoc.url);
    } else if (selectedDoc.content) {
      setPdfSource(selectedDoc.content);
    } else {
      setPdfSource(null);
    }

    return () => {
      if (cleanupUrl) {
        URL.revokeObjectURL(cleanupUrl);
      }
    };
  }, [selectedDoc]);

  // --- LOCAL FILE INPUT HANDLER (FIXED) ---
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const newDoc = {
        name: file.name,
        blob: file,
        annotations: [],
      };
      
      try {
        // Await the saveDoc call to get a valid ID back from the database
        const id = await saveDoc(newDoc); 
        console.log("New document saved with ID:", id);
        // Now that we have a valid ID, we can safely update the state
        setSelectedDoc({ ...newDoc, id }); 
        setNumPages(null);
        setCurrentPage(1);
        setScale(1.0);
        setSelectionActions(null);
        setAnnotations([]);
      } catch (error) {
        console.error("Failed to save new document:", error);
        alert("Failed to load PDF. Please try again.");
      }
    } else if (file) {
      alert('Please select a PDF file.');
    }
  };

  const handleExplain = useCallback(() => {
    if (selectionActions?.text && startAIConversation) {
      startAIConversation(`Explain the following text: ${selectionActions.text}`);
      setSelectionActions(null);
    }
  }, [selectionActions, startAIConversation]);

  const handleSummarize = useCallback(() => {
    if (selectionActions?.text && startAIConversation) {
      startAIConversation(`Summarize the following text: ${selectionActions.text}`);
      setSelectionActions(null);
    }
  }, [selectionActions, startAIConversation]);

  const handleKeyPoints = useCallback(() => {
    if (selectionActions?.text && startAIConversation) {
      startAIConversation(`Extract the key points from the following text: ${selectionActions.text}`);
      setSelectionActions(null);
    }
  }, [selectionActions, startAIConversation]);

  const handleAskAI = useCallback(() => {
    if (selectionActions?.text && startAIConversation) {
      startAIConversation(
        `Let's discuss the following text. What do you want to know about it?\n\n"${selectionActions.text}"`,
      );
      setSelectionActions(null);
    }
  }, [selectionActions, startAIConversation]);

  const handleAddAnnotation = useCallback(
    (type, color) => {
      if (!selectionActions?.text) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const clientRects = Array.from(range.getClientRects());

      let pageNumberForAnnotation = currentPage;
      let pageContainerDomElement = null;

      for (let i = 0; i < pageContainerRefs.current.length; i++) {
        const container = pageContainerRefs.current[i];
        if (
          container &&
          container.contains(sel.anchorNode) &&
          container.contains(sel.focusNode)
        ) {
          pageContainerDomElement = container;
          pageNumberForAnnotation = i + 1;
          break;
        }
      }

      if (!pageContainerDomElement) {
        console.warn('Selection not found within a PDF page container. Cannot add annotation.');
        setSelectionActions(null);
        return;
      }

      const containerRect = pageContainerDomElement.getBoundingClientRect();

      const convertedRects = clientRects.map((r) => {
        const x = (r.left - containerRect.left) / scale;
        const y = (r.top - containerRect.top) / scale;
        const width = r.width / scale;
        const height = r.height / scale;
        return { x, y, width, height };
      });

      const newAnnotation = {
        id: Date.now().toString(),
        type: type,
        pageNumber: pageNumberForAnnotation,
        rects: convertedRects,
        color: color,
        text: selectionActions.text,
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectionActions(null);
    },
    [selectionActions, currentPage, scale],
  );

  const handleHighlight = () => handleAddAnnotation('highlight', 'rgba(255, 255, 0, 0.5)');
  const handleUnderline = () => handleAddAnnotation('underline', 'blue');

  const handleRemoveAnnotation = useCallback(
    (annotationId) => {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== annotationId));
      setIsEraserMode(false);
    },
    [],
  );

  const toggleEraserMode = () => {
    setIsEraserMode(!isEraserMode);
    setSelectionActions(null);
  };

  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setCurrentPage(1);
    setScale(1.0);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error('Error loading PDF document:', error);
    setPdfSource(null);
    setNumPages(null);
    setCurrentPage(1);
    setSelectionActions(null);
    setAnnotations([]);
  }, []);

  const goToPrevPage = useCallback(() => setCurrentPage((prev) => Math.max(prev - 1, 1)), []);
  const goToNextPage = useCallback(
    () => setCurrentPage((prev) => Math.min(prev + 1, numPages)),
    [numPages],
  );

  const handlePageInputBlur = useCallback(
    (event) => {
      const page = Number(event.target.value);
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
      }
    },
    [numPages],
  );

  const handlePageInputKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        const page = Number(event.target.value);
        if (page >= 1 && page <= numPages) {
          setCurrentPage(page);
        }
        event.target.blur();
      }
    },
    [numPages],
  );

  const zoomIn = useCallback(() => setScale((prev) => Math.min(prev + 0.2, 3.0)), []);
  const zoomOut = useCallback(() => setScale((prev) => Math.max(prev - 0.2, 0.5)), []);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isEraserMode) {
        return;
      }

      const sel = window.getSelection();
      const txt = sel?.toString().trim();

      if (scrollableRef.current && !scrollableRef.current.contains(sel.anchorNode)) {
        setSelectionActions(null);
        return;
      }

      if (txt && txt.length > 3) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionActions({
          text: txt,
          x: rect.right + 5,
          y: rect.top + window.scrollY,
        });
      } else {
        setSelectionActions(null);
      }
    };

    const currentScrollableRef = scrollableRef.current;
    if (currentScrollableRef) {
      currentScrollableRef.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (currentScrollableRef) {
        currentScrollableRef.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isEraserMode]);

  return (
    <Paper
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* PDF Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          p: 1,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <Tooltip title="Upload Local PDF">
          <Button component="label" variant="contained" startIcon={<UploadFileIcon />} sx={{ textTransform: 'none' }}>
            Open PDF
            <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
          </Button>
        </Tooltip>
        <Tooltip title="Previous Page">
          <IconButton onClick={goToPrevPage} disabled={currentPage <= 1 || !numPages}>
            <NavigateBeforeIcon />
          </IconButton>
        </Tooltip>
        <TextField
          variant="outlined"
          size="small"
          value={currentPage}
          onChange={(e) => setCurrentPage(Number(e.target.value))}
          onBlur={handlePageInputBlur}
          onKeyDown={handlePageInputKeyDown}
          sx={{ width: 60, '.MuiInputBase-input': { textAlign: 'center' } }}
          InputProps={{
            endAdornment: <InputAdornment position="end">/{numPages || '-'}</InputAdornment>,
          }}
          disabled={!numPages}
        />
        <Tooltip title="Next Page">
          <IconButton onClick={goToNextPage} disabled={currentPage >= numPages || !numPages}>
            <NavigateNextIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton onClick={zoomOut} disabled={scale <= 0.5 || !numPages}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ width: 50, textAlign: 'center' }}>
          {`${Math.round(scale * 100)}%`}
        </Typography>
        <Tooltip title="Zoom In">
          <IconButton onClick={zoomIn} disabled={scale >= 3.0 || !numPages}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={isEraserMode ? 'Exit Eraser Mode' : 'Erase Highlights'}>
          <IconButton onClick={toggleEraserMode} color={isEraserMode ? 'primary' : 'default'}>
            <BorderColorIcon />
          </IconButton>
        </Tooltip>
        {isEraserMode && (
          <Tooltip title="Exit Eraser Mode">
            <IconButton onClick={() => setIsEraserMode(false)}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'auto',
          pt: 1,
          pb: 2,
          minWidth: 0,
          minHeight: 0,
          border: pdfSource ? '1px solid #ccc' : 'none',
          m: 1,
          cursor: isEraserMode ? 'crosshair' : 'default',
        }}
        ref={scrollableRef}
      >
        {!pdfSource ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No document selected.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Use "Open PDF" to load a file.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: `${fixedPageWidth * scale}px`,
              minHeight: '100%',
              position: 'relative',
              bgcolor: 'background.paper',
              boxShadow: 3,
              overflow: 'hidden',
            }}
          >
            <Document
              file={pdfSource}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                  <Typography>Loading PDF...</Typography>
                </Box>
              }
              error={(error) => (
                <Box sx={{ p: 2, color: 'error.main', textAlign: 'center' }}>
                  Failed to load PDF: {error?.message || 'Unknown error'}
                  <br />
                  Please ensure it's a valid PDF file.
                </Box>
              )}
              noData={
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography>No PDF data.</Typography>
                </Box>
              }
            >
              {Array.from(new Array(numPages || 0), (el, index) => {
                const pageNumber = index + 1;
                const pageAnnotations = annotations.filter((ann) => ann.pageNumber === pageNumber);

                return (
                  <div
                    key={`pageContainer_${pageNumber}`}
                    ref={(el) => (pageContainerRefs.current[index] = el)}
                    style={{ position: 'relative', marginBottom: '10px' }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={fixedPageWidth * scale}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                    <PdfAnnotationLayer
                      pageNumber={pageNumber}
                      annotations={pageAnnotations}
                      scale={scale}
                      fixedPageWidth={fixedPageWidth}
                      isEraserMode={isEraserMode}
                      onRemoveAnnotation={handleRemoveAnnotation}
                    />
                  </div>
                );
              })}
            </Document>
          </Box>
        )}
      </Box>
      {selectionActions && (
        <SelectionActions
          x={selectionActions.x}
          y={selectionActions.y}
          onExplain={handleExplain}
          onSummarize={handleSummarize}
          onKeyPoints={handleKeyPoints}
          onAskAI={handleAskAI}
          onHighlight={handleHighlight}
          onUnderline={handleUnderline}
          disabled={aiLoading}
        />
      )}
    </Paper>
  );
};

export default DocumentViewer;
