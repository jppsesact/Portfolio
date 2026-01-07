import { GoogleGenAI } from "@google/genai";
import { Holding, PortfolioStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePortfolioWithGemini = async (
  holdings: Holding[], 
  stats: PortfolioStats
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    return "Erro: Chave de API não configurada. Por favor, verifique o ambiente.";
  }

  const portfolioSummary = {
    totalValue: stats.totalValue,
    gainPercent: stats.totalGainPercent,
    holdings: holdings.map(h => ({
      ticker: h.asset.ticker,
      type: h.asset.type,
      sector: h.asset.sector,
      weight: stats.totalValue > 0 ? ((h.quantity * h.currentPrice) / stats.totalValue * 100).toFixed(2) + '%' : '0%',
      gain: h.averagePrice > 0 ? ((h.currentPrice - h.averagePrice) / h.averagePrice * 100).toFixed(2) + '%' : '0%'
    }))
  };

  const prompt = `
    Você é um consultor financeiro especialista de alto nível (como um CFA).
    Analise o seguinte portfólio de investimentos em JSON e forneça um relatório em formato Markdown.
    
    Dados do Portfólio:
    ${JSON.stringify(portfolioSummary, null, 2)}

    O relatório deve conter:
    1. **Análise de Risco**: Avalie a diversificação (setorial, classe de ativos).
    2. **Pontos Fortes**: O que está a carregar o portfólio.
    3. **Pontos de Atenção**: Ativos com performance muito negativa ou sobrealocação.
    4. **Sugestões Práticas**: 3 ações concretas de rebalanceamento ou proteção.

    Seja direto, profissional e use formatação rica (negrito, listas). Responda em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro ao comunicar com a IA. Tente novamente mais tarde.";
  }
};