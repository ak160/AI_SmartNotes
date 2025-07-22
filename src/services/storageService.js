// src/services/storageService.js
import { openDB } from 'idb';

const DB_NAME = 'DocsViewerAI';
const STORE_NAME = 'documents';
const DB_VERSION = 2;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`IndexedDB 'DocsViewerAI' upgrade triggered for storageService. Old version: ${oldVersion}, New version: ${newVersion}`);
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log(`Creating object store: '${STORE_NAME}'`);
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      } else {
        console.log(`Object store '${STORE_NAME}' already exists.`);
      }

      const NOTES_STORE_NAME = 'notes'; 
      if (!db.objectStoreNames.contains(NOTES_STORE_NAME)) {
        console.log(`Creating missing object store: '${NOTES_STORE_NAME}'`);
        db.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id' });
      }
    },
    blocked() {
      console.warn('Database access blocked: Another tab might be holding an older version of the database. Please close other tabs.');
      alert('Database access blocked. Please close any other open tabs using this application and refresh.');
    },
    blocking(currentVersion) {
      console.log(`Database is blocking an older connection at version ${currentVersion}`);
    }
  });
}

export async function saveDoc(doc) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    let id;
    if (doc.id) {
      await tx.store.put(doc);
      id = doc.id;
    } else {
      id = await tx.store.add(doc);
    }
    await tx.done;
    console.log(`Document '${doc.name}' (ID: ${id}) saved/updated successfully.`);
    return id;
  } catch (error) {
    console.error(`Error saving document '${doc.name}':`, error);
    throw error;
  }
}

export async function getAllDocs() {
  try {
    const db = await getDB();
    const allDocs = await db.getAll(STORE_NAME);
    console.log(`Retrieved ${allDocs.length} documents.`);
    return allDocs;
  } catch (error) {
    console.error("Error getting all documents:", error);
    return [];
  }
}

export async function deleteDoc(id) {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    console.log(`Document with ID '${id}' deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting document with ID '${id}':`, error);
    throw error;
  }
}

// === NEW FUNCTION ===
export async function clearAllDocs() {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
    console.log(`All documents in '${STORE_NAME}' store cleared.`);
  } catch (error) {
    console.error("Error clearing all documents:", error);
    throw error;
  }
}