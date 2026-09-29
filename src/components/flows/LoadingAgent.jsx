import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Scroll, Loader2, Search, PenTool, Image as ImageIcon, Save, Sparkles } from 'lucide-react';
import { useStory } from '../../context/StoryContext';

const LOADING_TIPS = [
    "Sabia que cada jornada custa apenas 1 Cristal Mágico? 💎",
    "Use o botão de dado 🎲 para ter ideias de histórias surpreendentes!",
    "Você pode criar vários heróis e escolher quem participará da aventura. 🦸‍♂️",
    "Experimente o estilo 'Pixel Art' para uma pegada retrô incrível! 🎮",
    "Na Biblioteca, você pode reler todas as suas histórias épicas! 📚",
    "Precisa de mais cristais? Visite a Loja para recarregar sua magia! ✨",
    "Dê um papel e personalidade para cada herói na Etapa 3 da criação! 🎭",
    "Explore universos como Star Wars ou Harry Potter para cenários únicos! 🏰",
    "O estilo 'Studio Ghibli' deixa suas ilustrações com um ar poético. 🍃",
    "Mude o universo para ver como seu herói ficaria em outros mundos! 🌌",
    "Você pode personalizar o apelido de cada herói para a história atual! ✏️",
    "Gêneros como 'Terror' ou 'Mistério' criam tramas cheias de suspense. 🔦",
    "Clique nos cards do Universo para ver uma prévia do que te espera! 🗺️",
    "O progresso da forja mostra exatamente em que pé está seu livro. ⏳",
    "Sua criatividade é o limite! Sinta-se livre para inventar qualquer trama. 🌈"
];

export default function LoadingAgent() {
    const { generationState } = useStory();
    const { step, stepProgress } = generationState;
    const [currentTip, setCurrentTip] = useState(0);

    // Troca a dica periodicamente
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % LOADING_TIPS.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        { name: "Analisando Vislumbres", icon: Search, color: "text-emerald-500" },
        { name: "Tecendo o Enredo", icon: PenTool, color: "text-blue-500" },
        { name: "Pintando Sonhos", icon: ImageIcon, color: "text-purple-500" },
        { name: "Selando o Pergaminho", icon: Save, color: "text-pink-500" }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden bg-[#faf9fe]">
            {/* Background Mágico Dinâmico */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-200/40 to-transparent rounded-full blur-[100px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 to-transparent rounded-full blur-[100px]"
                />
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 mb-10"
            >
                <div className="relative group">
                    {/* Anéis Ornamentais */}
                    <div className="absolute inset-[-20px] rounded-full border border-indigo-100/50 animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-[-10px] rounded-full border border-purple-100/50 animate-[spin_15s_linear_infinite_reverse]" />
                    
                    <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full animate-pulse" />
                    
                    <div className="relative z-10 bg-white p-6 rounded-full shadow-2xl shadow-indigo-100 border border-indigo-50 flex items-center justify-center overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-dashed border-indigo-100/50 rounded-full"
                        />
                        <div className="relative">
                            <BookOpen size={48} className="text-indigo-600 animate-pulse" />
                            <motion.div 
                                className="absolute -top-1 -right-1 text-yellow-400"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Sparkles size={18} fill="currentColor" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="relative z-10 space-y-2 mb-10">
                <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Criando sua Obra-Prima
                </h2>
                
                {/* Sistema de Dicas (Minecraft Style) */}
                <div className="h-6 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentTip}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="text-indigo-500 font-medium italic text-sm tracking-wide"
                        >
                            {LOADING_TIPS[currentTip]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Cartão de Progresso Premium */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-xl bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-white relative z-10"
            >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <Scroll size={20} />
                        </div>
                        <span className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">Progresso da Forja</span>
                    </div>
                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        {step + 1} de {steps.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((stepData, index) => {
                        const isCompleted = step > index;
                        const isCurrent = step === index;
                        const isPending = step < index;
                        const Icon = stepData.icon;
                        const currentProgress = isCompleted ? 100 : (isCurrent ? stepProgress : 0);

                        return (
                            <div 
                                key={index} 
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border
                                    ${isCurrent ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-transparent border-transparent'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500
                                        ${isCompleted ? 'bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100/50' : 
                                          isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 
                                          'bg-slate-100 text-slate-400 opacity-50'}`}
                                    >
                                        <Icon size={22} className={isCurrent ? 'animate-bounce' : ''} />
                                    </div>
                                    {isCurrent && (
                                        <div className="absolute -inset-1 rounded-xl bg-indigo-400/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                                    )}
                                </div>

                                <div className="flex flex-col text-left overflow-hidden">
                                    <span className={`text-sm font-bold transition-colors duration-500 truncate
                                        ${isCompleted ? 'text-slate-700' : isCurrent ? 'text-indigo-900' : 'text-slate-400'}`}
                                    >
                                        {stepData.name}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1.5 w-full max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${currentProgress}%` }}
                                                className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                                            />
                                        </div>
                                        {isCurrent && (
                                            <span className="text-[10px] font-black text-indigo-500/80 uppercase tabular-nums">
                                                {stepProgress}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}


