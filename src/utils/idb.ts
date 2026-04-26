/**
 * @module utils.idb
 * @description IndexedDB caching utility.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ElectIQDB extends DBSchema {
  geminiCache: {
    key: string;
    value: {
      hash: string;
      response: string;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ElectIQDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ElectIQDB>('electiq-db', 1, {
      upgrade(db) {
        db.createObjectStore('geminiCache', { keyPath: 'hash' });
      },
    });
  }
  return dbPromise;
};

export const getCachedResponse = async (hash: string): Promise<string | null> => {
  const db = await initDB();
  const entry = await db.get('geminiCache', hash);
  if (!entry) return null;

  // 24 hours TTL
  if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
    await db.delete('geminiCache', hash);
    return null;
  }
  return entry.response;
};

export const setCachedResponse = async (hash: string, response: string): Promise<void> => {
  const db = await initDB();
  await db.put('geminiCache', {
    hash,
    response,
    timestamp: Date.now(),
  });
};
