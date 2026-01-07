import { createClient } from '@supabase/supabase-js';
import { Holding } from '../types';

// NOTA: Em um ambiente real, estas variáveis viriam de process.env
// Para esta demonstração, assumimos que as variáveis estão configuradas no ambiente.
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || 'https://sua-url.supabase.co';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || 'sua-chave-anonima';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * READ: Procura todos os ativos de um utilizador específico.
 */
export const fetchUserHoldings = async (userId: string): Promise<Holding[]> => {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Erro ao buscar holdings:', error);
    throw new Error(error.message);
  }

  // Mapear snake_case da DB para camelCase do Frontend
  return data.map((item: any) => ({
    id: item.id,
    asset: item.asset_data, // Assumindo que guardamos o objeto Asset como JSONB
    quantity: item.quantity,
    averagePrice: item.average_price,
    currentPrice: item.current_price,
    lastUpdated: item.last_updated
  }));
};

/**
 * CREATE / UPDATE: Salva ou atualiza um ativo (Upsert).
 */
export const upsertHolding = async (userId: string, holding: Holding): Promise<void> => {
  const { error } = await supabase
    .from('holdings')
    .upsert({
      id: holding.id,
      user_id: userId,
      asset_data: holding.asset,
      quantity: holding.quantity,
      average_price: holding.averagePrice,
      current_price: holding.currentPrice,
      last_updated: new Date().toISOString()
    }, { onConflict: 'id' });

  if (error) {
    console.error('Erro ao salvar holding:', error);
    throw new Error(error.message);
  }
};

/**
 * DELETE: Remove um ativo pelo ID.
 */
export const removeHolding = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('holdings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao eliminar holding:', error);
    throw new Error(error.message);
  }
};

/**
 * BULK CREATE: Sincronização em lote (útil para importações).
 */
export const syncBulkHoldings = async (userId: string, holdings: Holding[]): Promise<void> => {
  const payload = holdings.map(h => ({
    id: h.id,
    user_id: userId,
    asset_data: h.asset,
    quantity: h.quantity,
    average_price: h.averagePrice,
    current_price: h.currentPrice,
    last_updated: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('holdings')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Erro no bulk upsert:', error);
    throw new Error(error.message);
  }
};