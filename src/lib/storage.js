import { openDB } from "idb";

const DB_NAME = "kupon-generator-db";
const STORE = "generators";
const VERSION = 1;

const dbPromise = openDB(DB_NAME, VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    }
  }
});

export async function saveGeneration(data) {
  const db = await dbPromise;
  await db.put(STORE, data);
  return data;
}

export async function getGenerations() {
  const db = await dbPromise;
  return db.getAll(STORE);
}

export async function deleteGeneration(id) {
  const db = await dbPromise;
  await db.delete(STORE, id);
}

export async function clearGenerations() {
  const db = await dbPromise;
  await db.clear(STORE);
}