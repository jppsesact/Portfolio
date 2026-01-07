
const DB_NAME = 'InvestFlowDB';
const DB_VERSION = 2;

export enum StoreNames {
  USERS = 'users',
  HOLDINGS = 'holdings',
  TRANSACTIONS = 'transactions'
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Erro ao abrir base de dados", event);
      reject("Erro ao abrir base de dados");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store de Utilizadores
      if (!db.objectStoreNames.contains(StoreNames.USERS)) {
        db.createObjectStore(StoreNames.USERS, { keyPath: 'email' });
      }

      // Store de Ativos (Holdings)
      if (!db.objectStoreNames.contains(StoreNames.HOLDINGS)) {
        const holdingStore = db.createObjectStore(StoreNames.HOLDINGS, { keyPath: 'id' });
        // Criar índice para procurar ativos por utilizador
        holdingStore.createIndex('userId', 'userId', { unique: false });
      }

      // Store de Transações
      if (!db.objectStoreNames.contains(StoreNames.TRANSACTIONS)) {
        const txStore = db.createObjectStore(StoreNames.TRANSACTIONS, { keyPath: 'id' });
        txStore.createIndex('userId', 'userId', { unique: false });
        txStore.createIndex('ticker', 'ticker', { unique: false });
      }
    };
  });
};

export const getStore = async (storeName: string, mode: IDBTransactionMode) => {
  const db = await initDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};
