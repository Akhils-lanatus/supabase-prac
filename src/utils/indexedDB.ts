const DB_NAME = "offline_DB";
const DB_VERSION = 2;
const STORES = ["project", "packages", "reports"];
export type Stores = "project" | "packages" | "reports";
let db: IDBDatabase | null = null;

const isValidStore = (store: Stores): boolean => {
  return STORES.includes(store);
};

export const initDB = (): Promise<void> => {
  if (db) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      STORES.forEach((store) => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
};

export const addElement = async (
  store: Stores,
  payload: Array<Record<string, unknown>>
): Promise<void> => {
  if (!isValidStore(store)) {
    throw new Error(`Invalid store name: "${store}"`);
  }

  if (!db) await initDB();
  if (!db) throw new Error("DB not initialized");

  return new Promise((resolve, reject) => {
    if (db) {
      const transaction = db.transaction(store, "readwrite");
      const objectStore = transaction.objectStore(store);

      for (const item of payload) {
        objectStore.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    }
  });
};

export const getElement = async <T>(store: Stores, key: string): Promise<T> => {
  if (!isValidStore(store)) {
    throw new Error(`Invalid store name: "${store}"`);
  }

  if (!db) await initDB();
  if (!db) throw new Error("DB not initialized");

  return new Promise<T>((resolve, reject) => {
    if (db) {
      const transaction = db.transaction(store, "readonly");
      const objectStore = transaction.objectStore(store);
      const request =
        key === "all" ? objectStore.getAll() : objectStore.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }
  });
};

export const clearAllStores = async (): Promise<void> => {
  if (!db) await initDB();
  if (!db) throw new Error("DB not initialized");

  return new Promise<void>((resolve, reject) => {
    if (db) {
      const transaction = db.transaction(STORES, "readwrite");

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const storeName of STORES) {
        const store = transaction.objectStore(storeName);
        store.clear();
      }
    }
  });
};
