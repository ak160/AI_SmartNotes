// src/services/noteService.js
import { openDB } from 'idb';

const DB_NAME = 'DocsViewerAI';
const STORE_NAME = 'notes';
const DB_VERSION = 2;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) { 
      console.log(`IndexedDB upgrade triggered. Old version: ${oldVersion}, New version: ${newVersion}`);
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log(`Creating object store: ${STORE_NAME}`);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      } else {
        console.log(`Object store '${STORE_NAME}' already exists.`);
      }
    },
    blocked() {
      console.warn('Database upgrade is blocked. Close other tabs using this database.');
      alert('Database upgrade is blocked. Please close any other open tabs using this application.');
    },
    blocking(currentVersion) {
      console.log(`Database is blocking an older connection at version ${currentVersion}`);
    }
  });
}

export async function getNote(docId) {
  try {
    const db = await getDB();
    const rec = await db.get(STORE_NAME, docId);
    return rec?.text || '';
  } catch (error) {
    console.error(`Error getting note for docId ${docId}:`, error);
    return '';
  }
}

export async function saveNote(docId, text) {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, { id: docId, text });
    console.log(`Note for doc ID: ${docId} saved successfully.`);
  } catch (error) {
    console.error(`Error saving note for docId ${docId}:`, error);
    throw error;
  }
}

// === NEW FUNCTION ===
export async function clearAllNotes() {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    console.log(`All notes in '${STORE_NAME}' store cleared.`);
  } catch (error) {
    console.error("Error clearing all notes:", error);
    throw error;
  }
}