export enum AssetType {
  STOCK = 'Ação',
  ETF = 'ETF',
  REIT = 'FII',
  CRYPTO = 'Cripto',
  CASH = 'Caixa'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  BRL = 'BRL'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Asset {
  ticker: string;
  name: string;
  type: AssetType;
  sector: string;
  currency: Currency;
  logoUrl?: string;
}

export interface Holding {
  id: string;
  asset: Asset;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  lastUpdated: string;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  currency: Currency;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface HistoryPoint {
  date: string;
  value: number;
  benchmark: number;
  [key: string]: any;
}