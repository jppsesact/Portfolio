import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  Timestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Holding } from "../types";

// As chaves de API do Firebase são públicas por design no frontend, 
// mas devem ser geridas via variáveis de ambiente no build.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSy...", 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "investflow-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "investflow-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "investflow-app.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:12345:web:abcde"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const HOLDINGS_COLLECTION = "holdings";

/**
 * READ: Procura todos os ativos do utilizador logado no Firestore.
 */
export const fetchUserHoldings = async (userId: string): Promise<Holding[]> => {
  try {
    const q = query(collection(db, HOLDINGS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        asset: data.asset,
        quantity: data.quantity,
        averagePrice: data.averagePrice,
        currentPrice: data.currentPrice,
        lastUpdated: data.lastUpdated instanceof Timestamp 
          ? data.lastUpdated.toDate().toISOString() 
          : data.lastUpdated
      } as Holding;
    });
  } catch (error) {
    console.error("Erro Firestore Fetch:", error);
    throw error;
  }
};

/**
 * CREATE / UPDATE: Grava um ativo no Firestore.
 */
export const upsertHolding = async (userId: string, holding: Holding): Promise<void> => {
  // Garantir consistência: o ID do documento deve ser único por utilizador/ticker
  const holdingId = holding.id && !holding.id.startsWith('t212') 
    ? holding.id 
    : `${userId}_${holding.asset.ticker}`;
    
  const docRef = doc(db, HOLDINGS_COLLECTION, holdingId);
  
  await setDoc(docRef, {
    asset: holding.asset,
    quantity: holding.quantity,
    averagePrice: holding.averagePrice,
    currentPrice: holding.currentPrice,
    id: holdingId,
    userId: userId,
    lastUpdated: Timestamp.now()
  }, { merge: true });
};

/**
 * DELETE: Remove um ativo do Firestore.
 */
export const removeHolding = async (id: string): Promise<void> => {
  const docRef = doc(db, HOLDINGS_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * BULK SYNC: Sincroniza vários ativos (importação massiva).
 */
export const bulkSyncHoldings = async (userId: string, holdings: Holding[]): Promise<void> => {
  const batch = writeBatch(db);
  
  holdings.forEach(holding => {
    const holdingId = `${userId}_${holding.asset.ticker}`;
    const docRef = doc(db, HOLDINGS_COLLECTION, holdingId);
    batch.set(docRef, {
      asset: holding.asset,
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      currentPrice: holding.currentPrice,
      id: holdingId,
      userId: userId,
      lastUpdated: Timestamp.now()
    }, { merge: true });
  });

  await batch.commit();
};