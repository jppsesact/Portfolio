import React from 'react';
import { LayoutDashboard, PieChart, TrendingUp, BrainCircuit, Settings, Wallet, LogOut } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'holdings', label: 'Ativos', icon: Wallet },
    { id: 'analytics', label: 'Análises', icon: PieChart },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'advisor', label: 'Advisor IA', icon: BrainCircuit },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-all duration-300">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-0 md:mr-3">
          IF
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-white">InvestFlow</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-2 md:px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-center md:justify-start p-3 rounded-xl transition-all duration-200 group
                ${active 
                  ? 'bg-blue-600/10 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`hidden md:block ml-3 font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {active && <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center justify-center md:justify-start p-2 mb-2 rounded-xl bg-slate-800/50">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-8 h-8 rounded-full bg-slate-700"
          />
          <div className="hidden md:block ml-3 overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start p-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="hidden md:block ml-3 font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};