import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, X, ChevronRight, Library } from 'lucide-react';

export default function StoryCompletionToast({ notification, onReadNow, onOpenLibrary, onClose }) {
    if (!notification) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-6 right-4 sm:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 select-none"
            >
                <div className="bg-white rounded-3xl border-2 border-[#9D7FEA] border-b-4 border-b-[#8364D8] p-4.5 shadow-2xl relative overflow-hidden flex flex-col gap-3">
                    {/* Brilho de fundo sutil */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-100 rounded-full blur-2xl pointer-events-none opacity-60" />

                    {/* Header com celebração */}
                    <div className="flex items-start justify-between gap-2 relative z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#9D7FEA] to-[#8364D8] text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7E57C2] block">
                                    História Concluída! 🎉
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 font-heading leading-tight truncate max-w-[220px]">
                                    {notification.title || 'Livro Mágico Pronto'}
                                </h4>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug relative z-10">
                        Seu novo livro já foi ilustrado, encadernado e guardado com carinho na sua Biblioteca!
                    </p>

                    {/* Ações */}
                    <div className="flex items-center gap-2 pt-1 relative z-10">
                        <button
                            type="button"
                            onClick={onReadNow}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#9D7FEA] hover:bg-[#8F6EE5] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <BookOpen size={14} />
                            <span>Ler Agora</span>
                        </button>

                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-white text-slate-700 border border-[#EAE5DC] hover:border-[#9D7FEA] font-bold text-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Library size={14} className="text-[#9D7FEA]" />
                            <span>Biblioteca</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
