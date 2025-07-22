// src/context/DocProvider.jsx
import React, { useState } from 'react';
import { DocContext } from './DocContext';

export const DocProvider = ({ children }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  return (
    <DocContext.Provider value={{ selectedDoc, setSelectedDoc }}>
      {children}
    </DocContext.Provider>
  );
};
