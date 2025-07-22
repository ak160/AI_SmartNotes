// src/context/useDoc.js
import { useContext } from 'react';
import { DocContext } from './DocContext';
export const useDoc = () => useContext(DocContext);
