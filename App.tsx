import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { AllocationChart, PerformanceChart } from './components/Charts';
import { HoldingsTable } from './components/HoldingsTable';
import { AssetType, Currency, Holding, PortfolioStats, User } from './types';
import { analyzePortfolioWithGemini } from './services/geminiService';
import { fetchTrading212Portfolio } from './services/trading212Service';
import { getUserHoldings, bulkSaveHoldings } from './services/portfolioService';
import { subscribeToAuthChanges, logoutUser } from './services/authService';
import { AuthScreen } from './components/AuthScreen';
import { ImportModal } from './components/ImportModal';
import { Wallet, TrendingUp, DollarSign, Activity, Loader2, Sparkles, BrainCircuit, Download } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [holdings, setHoldings] = useState<Holding[]>([]);
  
  // UI States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Escutar mudanças de autenticação (Firebase Auth)
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserData(user.id);
      } else {
        setHoldings([]);
      }
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const dbHoldings = await getUserHoldings(userId);
      setHoldings(dbHoldings);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
    setAiAnalysis(null);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadUserData(user.id);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setHoldings([]);
    setAiAnalysis(null);
  };

  const handleImportT212 = async (apiKey: string, isDemo: boolean) => {
    if (!currentUser) return;
    
    try {
      const newHoldings = await fetchTrading212Portfolio(apiKey, isDemo);
      
      // Merge local para feedback instantâneo
      const mergedHoldings = [...holdings];
      newHoldings.forEach(newH => {
        const index = mergedHoldings.findIndex(h => h.asset.ticker === newH.asset.ticker);
        if (index >= 0) {
          mergedHoldings[index] = { ...mergedHoldings[index], ...newH };
        } else {
          mergedHoldings.push(newH);
        }
      });

      // Sincronizar com Cloud Firestore
      await bulkSaveHoldings(currentUser.id, mergedHoldings);
      setHoldings(mergedHoldings);
      
    } catch (error) {
      throw error;
    }
  };

  const stats: PortfolioStats = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach(h => {
      totalValue += h.quantity * h.currentPrice;
      totalCost += h.quantity * h.averagePrice;
    });

    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGain, totalGainPercent, currency: Currency.USD };
  }, [holdings]);

  const allocationData = useMemo(() => {
    const sectors: Record<string, number> = {};
    holdings.forEach(h => {
      const val = h.quantity * h.currentPrice;
      sectors[h.asset.sector] = (sectors[h.asset.sector] || 0) + val;
    });
    return Object.keys(sectors).map(sector => ({ name: sector, value: sectors[sector] }));
  }, [holdings]);

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const result = await analyzePortfolioWithGemini(holdings, stats);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
              {currentView === 'dashboard' && 'Visão Geral'}
              {currentView === 'holdings' && 'Meus Ativos'}
              {currentView === 'advisor' && 'AI Advisor'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Dados sincronizados via Firebase Cloud Firestore.
            </p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
                onClick={() => setIsImportModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
             >
                <Download size={16} className="mr-2" />
                Importar T212
             </button>
             <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20">
                + Nova Transação
             </button>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Patrimônio Total" 
                value={`$${stats.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                change="+2.4%" 
                isPositive={true} 
                icon={<Wallet size={20} />}
              />
              <StatCard 
                title="Rentabilidade" 
                value={`$${stats.totalGain.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                change={`${stats.totalGainPercent.toFixed(2)}%`} 
                isPositive={stats.totalGain >= 0} 
                icon={<TrendingUp size={20} />}
              />
              <StatCard title="Dividendos" value="$142.50" change="+12%" isPositive={true} icon={<DollarSign size={20} />} />
              <StatCard title="Sharpe Ratio" value="1.85" isPositive={true} icon={<Activity size={20} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-sm">
                <PerformanceChart data={[]} /> {/* Histórico real exigiria nova coleção no Firestore */}
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-sm flex flex-col">
                <AllocationChart data={allocationData} />
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
              <HoldingsTable holdings={holdings.slice(0, 5)} />
            </div>
          </div>
        )}

        {currentView === 'holdings' && (
           <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
             <HoldingsTable holdings={holdings} />
           </div>
        )}

        {currentView === 'advisor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-sm">
               <h2 className="text-xl font-bold text-slate-100 flex items-center mb-4">
                 <Sparkles className="mr-2 text-purple-400" size={24} />
                 Análise de IA
               </h2>
               <button
                 onClick={handleGenerateInsight}
                 disabled={isLoadingAi}
                 className="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center disabled:opacity-50"
               >
                 {isLoadingAi ? <Loader2 className="animate-spin mr-2" /> : 'Analisar Carteira'}
               </button>
            </div>
            <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-sm overflow-y-auto">
              {aiAnalysis ? (
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <BrainCircuit size={48} className="mb-2" />
                  <p>Inicie uma análise para ver os insights.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImportT212} 
      />
    </div>
  );
}