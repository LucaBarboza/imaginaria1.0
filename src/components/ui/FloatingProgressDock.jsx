import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

export default function FloatingProgressDock({ activeJob, onOpen }) {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!activeJob) return null;

    const progress = Math.min(Math.max(activeJob.stepProgress || 5, 5), 100);
    const title = activeJob.title || 'Criando Livro Mágico...';
    const message = activeJob.message || 'Pintando ilustrações e escrevendo narrativa...';

    if (isMinimized) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="fixed bottom-5 right-5 z-40 select-none"
            >
                <button
                    type="button"
                    onClick={() => setIsMinimized(false)}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-slate-800 border-2 border-[#EAE5DC] hover:border-[#9D7FEA] shadow-lg hover:shadow-xl transition-all cursor-pointer font-bold text-xs group"
                >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9D7FEA] animate-ping" />
                    <span className="text-[#7E57C2] font-extrabold">{progress}%</span>
                    <span className="text-slate-600 font-semibold truncate max-w-[120px]">
                        {activeJob.title || 'Criando...'}
                    </span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-5 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 select-none"
            >
                <div className="bg-white rounded-3xl border-2 border-[#EAE5DC] border-b-4 border-b-[#CDC4B6] p-4 shadow-xl relative overflow-hidden backdrop-blur-xs flex flex-col gap-2.5">
                    {/* Header do Mini Dock */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#EDE7F6] border border-[#D1C4E9] flex items-center justify-center text-[#7E57C2] shrink-0">
                                <Sparkles size={16} className="animate-spin text-[#9D7FEA]" style={{ animationDuration: '6s' }} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate font-heading leading-tight">
                                    {title}
                                </h4>
                                <p className="text-[11px] text-[#7E57C2] font-semibold truncate">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-black text-[#7E57C2] tabular-nums px-2 py-0.5 rounded-full bg-[#F4EEFD] border border-[#D1C4E9]">
                                {progress}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsMinimized(true)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Recolher para botão compacto"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Barra de Progresso Fina e Elegante */}
                    <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#EAE5DC] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                            className="h-full bg-gradient-to-r from-[#9D7FEA] to-[#8364D8] rounded-full"
                        />
                    </div>

                    {/* Ação: Acompanhar Tela Cheia */}
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-600 font-medium">
                            Gerando em segundo plano
                        </span>
                        <button
                            type="button"
                            onClick={onOpen}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EEFD] text-[#7E57C2] hover:text-[#5E35B1] border border-[#EAE5DC] hover:border-[#9D7FEA] font-bold text-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                            <BookOpen size={13} />
                            <span>Acompanhar</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
