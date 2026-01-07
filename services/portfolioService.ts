import { Holding } from '../types';
import * as firebaseService from './firebaseService';

/**
 * READ: Procura ativos no Cloud Firestore.
 */
export const getUserHoldings = async (userId: string): Promise<Holding[]> => {
  try {
    return await firebaseService.fetchUserHoldings(userId);
  } catch (err) {
    console.error("Erro ao carregar do Firestore:", err);
    throw new Error("Não foi possível carregar o seu portfólio da cloud.");
  }
};

/**
 * CREATE / UPDATE: Grava no Firestore.
 */
export const saveHolding = async (userId: string, holding: Holding): Promise<void> => {
  try {
    await firebaseService.upsertHolding(userId, holding);
  } catch (err) {
    console.error("Erro ao gravar no Firestore:", err);
    throw new Error("Erro ao sincronizar ativo com a cloud.");
  }
};

/**
 * DELETE: Remove do Firestore.
 */
export const deleteHolding = async (id: string): Promise<void> => {
  try {
    await firebaseService.removeHolding(id);
  } catch (err) {
    console.error("Erro ao eliminar no Firestore:", err);
    throw new Error("Erro ao remover ativo da cloud.");
  }
};

/**
 * BULK SAVE: Sincronização em lote com Firestore.
 */
export const bulkSaveHoldings = async (userId: string, holdings: Holding[]): Promise<void> => {
  try {
    await firebaseService.bulkSyncHoldings(userId, holdings);
  } catch (err) {
    console.error("Erro no bulk sync Firestore:", err);
    throw new Error("Falha ao sincronizar lote de ativos.");
  }
};