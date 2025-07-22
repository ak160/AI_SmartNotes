// src/components/LayoutGrid.jsx
import React, { useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import DocumentViewer from './DocumentViewer';
import NotesPanel from './NotesPanel';
import ChatPanel from './ChatPanel';
import { Box } from '@mui/material';
import './LayoutGrid.css';

const LayoutGrid = ({
  sidebarOpen,
  isChatOpen,
  onChatClose,
  startAIConversation,
  chatPanelRef,
  setLayoutMode
}) => {
  const containerRef = useRef();
  const notesPanelRef = useRef(null); // New: Create a ref for NotesPanel

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sidebarHandle = container.querySelector('.gutter-sidebar');
    const notesHandle = container.querySelector('.gutter-notes');
    const chatHandle = container.querySelector('.gutter-chat');

    const onMouseDown = (e, varName, resizeDir) => {
      e.preventDefault();
      let initialSize;
      let initialMouseX = e.clientX;
      initialSize = parseInt(container.style.getPropertyValue(varName), 10);

      const onMouseMove = (e) => {
        const delta = e.clientX - initialMouseX;
        let newSize;
        if (resizeDir === 'right') {
          newSize = initialSize + delta;
        } else {
          newSize = initialSize - delta;
        }

        const minSize = 250;
        const maxSize = 800;
        newSize = Math.max(minSize, Math.min(maxSize, newSize));

        container.style.setProperty(varName, `${newSize}px`);
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onSidebarMouseDown = (e) => onMouseDown(e, '--sidebar-width', 'right');
    const onNotesMouseDown = (e) => onMouseDown(e, '--notes-width', 'left');
    const onChatMouseDown = (e) => onMouseDown(e, '--chat-width', 'left');

    if (sidebarHandle) {
      sidebarHandle.addEventListener('mousedown', onSidebarMouseDown);
    }
    if (notesHandle) {
      notesHandle.addEventListener('mousedown', onNotesMouseDown);
    }
    if (chatHandle) {
      chatHandle.addEventListener('mousedown', onChatMouseDown);
    }

    return () => {
      if (sidebarHandle) {
        sidebarHandle.removeEventListener('mousedown', onSidebarMouseDown);
      }
      if (notesHandle) {
        notesHandle.removeEventListener('mousedown', onNotesMouseDown);
      }
      if (chatHandle) {
        chatHandle.removeEventListener('mousedown', onChatMouseDown);
      }
    };
  }, [isChatOpen, sidebarOpen]);
  
  // New: Define the handler that uses the NotesPanel ref
  const onInsertIntoNotes = (text) => {
    if (notesPanelRef.current && notesPanelRef.current.insertText) {
      notesPanelRef.current.insertText(text);
    }
  };

  const gridTemplateColumns = `
    var(--sidebar-width) 5px 
    1fr 5px 
    var(--chat-width) 5px 
    var(--notes-width)
  `;

  return (
    <div
      className="layout-container"
      ref={containerRef}
      style={{
        gridTemplateColumns: sidebarOpen ? gridTemplateColumns : '0px 0px 1fr 5px var(--chat-width) 5px var(--notes-width)',
        '--sidebar-width': '250px',
        '--notes-width': '400px',
        '--chat-width': '400px',
      }}
    >
      <div className="sidebar-area">
        <Sidebar setLayoutMode={setLayoutMode} />
      </div>

      <div className="gutter gutter-sidebar" />

      <div className="viewer-wrapper">
        <Box
          className="viewer-area"
          sx={{
            p: 2,
            border: theme => `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            boxSizing: 'border-box',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto'
          }}
        >
          <DocumentViewer startAIConversation={startAIConversation} />
        </Box>
      </div>

      {isChatOpen && (
        <>
          <div className="gutter gutter-chat" />
          <div className="chat-area">
            <ChatPanel
              ref={chatPanelRef}
              onClose={onChatClose}
              onInsertIntoNotes={onInsertIntoNotes} // Pass the new handler
            />
          </div>
        </>
      )}

      <>
        <div className="gutter gutter-notes" />
        <div
          className="notes-area"
          sx={{
            p: 2,
            minWidth: '350px', 
            border: theme => `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            boxSizing: 'border-box',
          }}
        >
          {/* New: Pass the ref to NotesPanel */}
          <NotesPanel ref={notesPanelRef} setLayoutMode={setLayoutMode} />
        </div>
      </>
    </div>
  );
};

export default LayoutGrid;