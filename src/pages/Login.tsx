import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
    onSignUpClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSignUpClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9] p-4">
            <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                <div className="mb-10 text-center">
                    <div className="inline-flex p-3.5 bg-zinc-900 rounded-2xl mb-6 text-white">
                        <LogIn size={28} strokeWidth={2.2} />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Bem-vindo de volta</h1>
                    <p className="text-slate-500 font-medium">Acesse sua conta para gerenciar suas finanças</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100/50 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={20} />
                        <p className="text-[14px] font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-700 ml-1">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-[15px] focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none placeholder:text-slate-400"
                                placeholder="exemplo@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-700 ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-[15px] focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-semibold text-[15px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? 'Entrando...' : (
                            <>
                                Entrar
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-8 border-t border-slate-50">
                    <p className="text-[14px] text-slate-500 font-medium">
                        Não tem uma conta?{' '}
                        <button
                            onClick={onSignUpClick}
                            className="text-zinc-900 font-bold hover:underline"
                        >
                            Criar conta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
