// src/components/PdfAnnotationLayer.jsx
import React, { useRef, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const PdfAnnotationLayer = ({ pageNumber, annotations, scale, fixedPageWidth, isEraserMode, onRemoveAnnotation }) => {
  const containerRef = useRef(null);

  const [adjustedAnnotations, setAdjustedAnnotations] = useState([]);

  // Adjust annotation coordinates based on current scale and page dimensions for display
  useLayoutEffect(() => {
    if (!annotations || !containerRef.current) return;

    const pageAnnotations = annotations.filter(
      (ann) => ann.pageNumber === pageNumber
    );

    const newAdjusted = pageAnnotations.map((ann) => {
      const scaledRects = ann.rects.map(rect => ({
        left: rect.x * scale,
        top: rect.y * scale,
        width: rect.width * scale,
        height: rect.height * scale,
      }));

      return {
        ...ann,
        displayRects: scaledRects,
      };
    });
    setAdjustedAnnotations(newAdjusted);
  }, [annotations, pageNumber, scale, fixedPageWidth]);

  // Handler for clicks on the annotation
  const handleAnnotationClick = (event, annotationId) => {
    // Stop event propagation to prevent it from triggering the text selection logic in the parent
    event.stopPropagation();
    event.preventDefault();
    
    // Only remove the annotation if eraser mode is active
    if (isEraserMode) {
      onRemoveAnnotation(annotationId);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${fixedPageWidth * scale}px`,
        height: '100%',
        // FIX: Set pointerEvents to 'none' by default.
        // This allows all mouse events to pass through to the text layer below.
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      {adjustedAnnotations.map((ann) =>
        ann.displayRects.map((rect, idx) => (
          <Box
            key={`${ann.id}-${idx}`}
            onClick={(e) => handleAnnotationClick(e, ann.id)}
            sx={{
              position: 'absolute',
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              backgroundColor: ann.type === 'highlight' ? ann.color : 'transparent',
              borderBottom: ann.type === 'underline' ? `2px solid ${ann.color}` : 'none',
              opacity: 0.7,
              // FIX: Set pointerEvents to 'auto' only when in eraser mode.
              // Otherwise, it inherits 'none' from the parent Box.
              pointerEvents: isEraserMode ? 'auto' : 'none',
              // FIX: Conditionally change the cursor
              cursor: isEraserMode ? 'crosshair' : 'default',
            }}
          />
        ))
      )}
    </Box>
  );
};

PdfAnnotationLayer.propTypes = {
  pageNumber: PropTypes.number.isRequired,
  annotations: PropTypes.array.isRequired,
  scale: PropTypes.number.isRequired,
  fixedPageWidth: PropTypes.number.isRequired,
  isEraserMode: PropTypes.bool.isRequired,
  onRemoveAnnotation: PropTypes.func.isRequired,
};

export default PdfAnnotationLayer;