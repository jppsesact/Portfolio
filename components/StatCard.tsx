import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-5 rounded-2xl shadow-sm hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {icon && <div className="text-slate-500 bg-slate-700/30 p-2 rounded-lg">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight">{value}</h2>
      </div>
      {change && (
        <div className={`flex items-center mt-2 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {change}
          <span className="text-slate-500 ml-1 font-normal">vs. mês passado</span>
        </div>
      )}
    </div>
  );
};