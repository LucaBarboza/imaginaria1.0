import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Wand } from 'lucide-react';
import MagicPortal from '../illustrations/MagicPortal';
import BackButton from '../ui/BackButton';

const Login = ({ onBack }) => {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            await loginWithGoogle();
        } catch (err) {
            console.error("Erro ao logar:", err);
            setError('Falha ao conectar com o Google. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[var(--color-bg-primary)] font-body text-slate-700">
            {/* Background com Blobs */}
            <div className="bg-blob bg-pink-200 w-[600px] h-[600px] -top-32 -left-32 opacity-30" />
            <div className="bg-blob bg-emerald-100 w-[500px] h-[500px] -bottom-32 -right-32 opacity-30" style={{ animationDelay: '3s' }} />

            {onBack && <BackButton onClick={onBack} />}

            {/* Conteúdo Principal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-6"
            >

                <div className="glass-card p-10 flex flex-col items-center text-center space-y-8 relative overflow-hidden">

                    {/* Brilhos decorativos estáticos */}
                    <Sparkles className="absolute top-6 left-6 text-pink-300 w-6 h-6 opacity-50" />
                    <Sparkles className="absolute bottom-6 right-6 text-emerald-300 w-6 h-6 opacity-50" />

                    {/* Portal Mágico - Arte Vetorial Premium (Animado) */}
                    <div className="w-56 h-56 relative flex items-center justify-center -mt-8 mb-6">
                        <MagicPortal />
                    </div>

                    {/* Título e Subtítulo */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold font-heading text-slate-800 tracking-tight"
                        >
                            Imaginaria
                        </motion.h1>
                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-500 font-medium leading-relaxed max-w-[80%] mx-auto"
                        >
                            A Chave do Portal.
                        </motion.p>
                    </div>

                    {/* Botão de Login Google Style */}
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full py-3 px-6 bg-white border-2 border-transparent hover:border-pink-200 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {/* Borda gradiente sutil via background hack */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />

                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-slate-300 border-t-pink-500 rounded-full animate-spin" />
                                Entrando...
                            </span>
                        ) : (
                            <>
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                <span>Entrar com Google</span>
                            </>
                        )}
                    </motion.button>

                    {/* Mensagem de Erro */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-400 text-xs mt-2 font-medium"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Footer sutil */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 text-slate-400 text-center text-xs"
            >
                <p>Mágica criada por IA</p>
            </motion.div>
        </div>
    );
};

export default Login;
