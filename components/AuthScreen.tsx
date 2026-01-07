import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, checkEmailAvailable } from '../services/authService';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2, AlertCircle, MailCheck, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'LOGIN' | 'REGISTER_INPUT' | 'REGISTER_VERIFY';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('LOGIN');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Erro ao efetuar login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!name) throw new Error("O nome é obrigatório.");
      if (password.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres.");

      // 1. Verificar disponibilidade do email antes de prosseguir
      const isAvailable = await checkEmailAvailable(email);
      if (!isAvailable) {
        throw new Error("Este endereço de email já está registado.");
      }

      // 2. Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
      setStep('REGISTER_VERIFY');
      setSuccessMessage(`Enviámos um código de confirmação para ${email}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulação de validação do código
      // Num sistema real, isto validaria contra o backend
      if (verificationCode !== '123456') {
        throw new Error("Código de verificação inválido. Tente '123456'.");
      }

      // 3. Criar utilizador na base de dados após confirmação
      const user = await registerUser(name, email, password);
      onLogin(user);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    if (step === 'LOGIN') {
      setStep('REGISTER_INPUT');
    } else {
      setStep('LOGIN');
    }
    setError(null);
    setSuccessMessage(null);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

        {/* --- HEADER --- */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
            IF
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            {step === 'LOGIN' && 'Bem-vindo de volta'}
            {step === 'REGISTER_INPUT' && 'Criar Conta'}
            {step === 'REGISTER_VERIFY' && 'Confirmar Email'}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 'LOGIN' && 'Aceda ao seu portfólio inteligente.'}
            {step === 'REGISTER_INPUT' && 'Comece a gerir seus investimentos hoje.'}
            {step === 'REGISTER_VERIFY' && 'Verifique a sua caixa de entrada.'}
          </p>
        </div>

        {/* --- ALERTS --- */}
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center text-rose-300 text-sm animate-fade-in relative z-10">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {successMessage && !error && (
           <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center text-emerald-300 text-sm animate-fade-in relative z-10">
             <MailCheck size={18} className="mr-2 flex-shrink-0" />
             {successMessage}
           </div>
        )}

        {/* --- FORMS --- */}
        <div className="relative z-10">
          
          {/* LOGIN FORM */}
          {step === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="exemplo@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center mt-6 shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na Conta'}
              </button>
            </form>
          )}

          {/* REGISTER INPUT FORM */}
          {step === 'REGISTER_INPUT' && (
            <form onSubmit={handleRegisterInputSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Nome</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="exemplo@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center mt-6 shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Continuar
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER VERIFY FORM */}
          {step === 'REGISTER_VERIFY' && (
             <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 mb-6">
                   <p className="text-slate-300 text-sm mb-2">Para fins de demonstração, o código é:</p>
                   <code className="bg-slate-800 px-3 py-1 rounded text-blue-400 font-mono text-lg font-bold tracking-widest border border-slate-700">123456</code>
                </div>

                <div>
                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Código de Confirmação</label>
                 <div className="relative group">
                   <input
                     type="text"
                     value={verificationCode}
                     onChange={(e) => setVerificationCode(e.target.value)}
                     className="w-full bg-slate-900/50 border border-slate-700 text-white text-center text-2xl tracking-[0.5em] font-mono rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 uppercase"
                     placeholder="000000"
                     maxLength={6}
                     required
                   />
                 </div>
               </div>

               <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={() => setStep('REGISTER_INPUT')}
                   className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-all"
                 >
                   Voltar
                 </button>
                 <button
                   type="submit"
                   disabled={isLoading}
                   className="flex-[2] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar & Criar'}
                 </button>
               </div>
             </form>
          )}

          {/* FOOTER SWITCH */}
          {step !== 'REGISTER_VERIFY' && (
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                {step === 'LOGIN' ? 'Novo no InvestFlow?' : 'Já tem conta?'}
                <button
                  onClick={toggleAuthMode}
                  className="text-blue-400 hover:text-blue-300 font-bold ml-1.5 transition-colors"
                >
                  {step === 'LOGIN' ? 'Criar agora' : 'Fazer Login'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};