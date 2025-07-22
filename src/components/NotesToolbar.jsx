// src/components/NotesToolbar.jsx

import React from 'react';
import { Box, useTheme } from '@mui/material';

// Import Quill's official stylesheet for the 'snow' theme
import 'quill/dist/quill.snow.css';
import './NoteToolbar.css'; // Custom styles for the toolbar
export default function NotesToolbar() {
  const theme = useTheme();

  return (

    <Box
      id="toolbar"
      className="ql-toolbar ql-snow"      // ← add these!
      sx={{
        // remove Quill’s default border so we can theme it:
        border: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        p: 1,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: theme.palette.background.paper,
        // force Quill icons/text to your theme’s text color:
        '& .ql-stroke, .ql-fill': {
          stroke: theme.palette.text.primary,
          fill: theme.palette.text.primary,
        },
      }}
    >
      {/* Basic formatting */}
      <select className="ql-header" defaultValue="" onChange={e => e.persist()}>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="">Normal</option>
      </select>
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <button className="ql-strike" />

      {/* Color and background */}
      <select className="ql-color" />
      <select className="ql-background" />

      {/* Lists, indent */}
      <button className="ql-list" value="ordered" />
      <button className="ql-list" value="bullet" />
      <button className="ql-indent" value="-1" />
      <button className="ql-indent" value="+1" />

      {/* Code block and inline code */}
      <button className="ql-code-block" />
      <button className="ql-code" />
    </Box>
  );
}