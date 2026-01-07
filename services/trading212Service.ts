import { AssetType, Currency, Holding } from "../types";

// Usamos um proxy público (corsproxy.io) para contornar a restrição CORS do navegador.
// Num ambiente de produção real, esta chamada deveria ser feita através de um backend próprio.
const PROXY_URL = 'https://corsproxy.io/?'; 

interface T212Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  ppl: number;
  fxPpl: number;
  initialFillDate: string;
  maxBuy: number;
  maxSell: number;
  pieQuantity: number;
}

export const fetchTrading212Portfolio = async (apiKey: string, isDemo: boolean = false): Promise<Holding[]> => {
  const baseUrl = isDemo 
    ? 'https://demo.trading212.com/api/v0' 
    : 'https://live.trading212.com/api/v0';

  const targetUrl = `${baseUrl}/equity/portfolio`;
  
  // Construímos a URL passando pelo proxy. O encodeURIComponent garante que a URL de destino seja tratada corretamente.
  const url = `${PROXY_URL}${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("API Key inválida ou expirada.");
      if (response.status === 403) throw new Error("Acesso negado. Verifique as permissões da sua chave.");
      if (response.status === 429) throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
      throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
    }

    const positions: T212Position[] = await response.json();

    if (!Array.isArray(positions)) {
      throw new Error("Formato de dados inesperado recebido da API.");
    }

    // Mapear para o formato interno do App
    return positions.map((pos, index) => {
      // Tentar inferir tipo. Trading212 não retorna metadados detalhados no endpoint de portfolio.
      // Assumimos Stocks por padrão, ou Crypto se tiver hífens ou USD no ticker (heurística simples).
      const type = (pos.ticker.includes('USD') || pos.ticker.length > 5) ? AssetType.CRYPTO : AssetType.STOCK;
      
      return {
        id: `t212-${pos.ticker}-${index}`,
        asset: {
          ticker: pos.ticker,
          name: pos.ticker, // O nome completo exigiria outra chamada à API de metadados
          type: type,
          sector: "Importado (T212)", 
          currency: Currency.USD, // A API reporta valores na moeda da conta, assumindo USD para simplificação ou dados brutos
        },
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        lastUpdated: new Date().toISOString()
      };
    });

  } catch (error: any) {
    console.error("Erro na integração T212:", error);

    // Tratamento de erro de rede genérico (comum quando o proxy falha ou bloqueadores de anúncio interferem)
    if (error.message === 'Failed to fetch') {
      throw new Error("Falha na conexão. Verifique sua internet ou se algum bloqueador de anúncios está impedindo o acesso ao proxy.");
    }
    
    throw error;
  }
};