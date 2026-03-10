import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Mail, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';

interface SignUpProps {
    onLoginClick: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onLoginClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9] p-4">
                <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60 text-center">
                    <div className="inline-flex p-4 bg-emerald-50 rounded-2xl mb-6 text-emerald-500">
                        <Mail size={32} strokeWidth={2.2} />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4">Verifique seu e-mail</h1>
                    <p className="text-slate-500 font-medium mb-8">
                        Enviamos um link de confirmação para o seu e-mail para ativar sua conta.
                    </p>
                    <button
                        onClick={onLoginClick}
                        className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-semibold text-[15px] hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9] p-4">
            <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/60">
                <div className="mb-10 text-center">
                    <div className="inline-flex p-3.5 bg-zinc-900 rounded-2xl mb-6 text-white">
                        <UserPlus size={28} strokeWidth={2.2} />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Criar Conta</h1>
                    <p className="text-slate-500 font-medium">Junte-se ao GGestor e domine suas economias</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100/50 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={20} />
                        <p className="text-[14px] font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-slate-700 ml-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-11 pr-4 text-[15px] focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none placeholder:text-slate-400"
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>

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
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-semibold text-[15px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? 'Criando conta...' : (
                            <>
                                Começar agora
                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-8 border-t border-slate-50">
                    <p className="text-[14px] text-slate-500 font-medium">
                        Já tem uma conta?{' '}
                        <button
                            onClick={onLoginClick}
                            className="text-zinc-900 font-bold hover:underline"
                        >
                            Entrar
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
