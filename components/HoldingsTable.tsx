import React from 'react';
import { Holding } from '../types';
import { ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-slate-400 text-sm border-b border-slate-700/50">
            <th className="py-4 font-medium pl-4">Ativo</th>
            <th className="py-4 font-medium">Setor</th>
            <th className="py-4 font-medium text-right">Preço</th>
            <th className="py-4 font-medium text-right">Preço Médio</th>
            <th className="py-4 font-medium text-right">Qtd</th>
            <th className="py-4 font-medium text-right">Valor Total</th>
            <th className="py-4 font-medium text-right pr-4">Retorno</th>
            <th className="py-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const totalValue = holding.quantity * holding.currentPrice;
            const gain = (holding.currentPrice - holding.averagePrice) * holding.quantity;
            const gainPercent = ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
            const isPositive = gain >= 0;

            return (
              <tr key={holding.id} className="group hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 last:border-0">
                <td className="py-4 pl-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mr-3">
                       {holding.asset.ticker.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200">{holding.asset.ticker}</div>
                      <div className="text-xs text-slate-500">{holding.asset.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    {holding.asset.sector}
                  </span>
                </td>
                <td className="py-4 text-right text-slate-300 font-medium">
                  {holding.asset.currency === 'USD' ? '$' : 'R$'}
                  {holding.currentPrice.toFixed(2)}
                </td>
                <td className="py-4 text-right text-slate-500">
                  {holding.asset.currency === 'USD' ? '$' : 'R$'}
                  {holding.averagePrice.toFixed(2)}
                </td>
                <td className="py-4 text-right text-slate-300">{holding.quantity}</td>
                <td className="py-4 text-right font-bold text-slate-200">
                  {holding.asset.currency === 'USD' ? '$' : 'R$'}
                  {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-right pr-4">
                  <div className={`flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
                    <span className="font-bold">{gainPercent.toFixed(2)}%</span>
                  </div>
                  <div className={`text-xs text-right ${isPositive ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                    {isPositive ? '+' : ''}{gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="py-4 text-right">
                  <button className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};