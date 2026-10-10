import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, PenTool, Palette, BookOpen, Sparkles, AlertCircle, X, ArrowLeft, Check, Compass } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import HomeMagicBook from '../illustrations/HomeMagicBook';

const STORY_CURIOSITIES = [
    "Cada ilustração é pintada do zero pela inteligência artificial para o seu livro.",
    "Suas histórias ficam guardadas na Biblioteca para você ler sempre que quiser.",
    "Heróis com papéis personalizados transformam cada reviravolta em uma surpresa.",
    "A inteligência artificial adapta o estilo visual para harmonizar com o universo escolhido.",
    "Crianças que leem histórias onde são protagonistas desenvolvem mais criatividade e afeto.",
    "Dizem que as melhores fábulas começam quando a imaginação ganha asas...",
    "Pintando cores vivas, luzes e detalhes encantados exclusivamente para esta aventura.",
    "As páginas mágicas do seu livro estão quase prontas para serem abertas!",
];

const STEPS = [
    {
        id: 'heroes',
        title: 'Conhecendo os Heróis',
        desc: 'Reunindo os personagens e preparando o portal',
        icon: Users,
    },
    {
        id: 'plot',
        title: 'Escrevendo o Enredo',
        desc: 'Criando diálogos, reviravoltas e lições mágicas',
        icon: PenTool,
    },
    {
        id: 'art',
        title: 'Ilustrando as Cenas',
        desc: 'Pintando a capa e cada página com IA generativa',
        icon: Palette,
    },
    {
        id: 'book',
        title: 'Encadernando o Livro',
        desc: 'Organizando páginas e finalizando seu novo livro',
        icon: BookOpen,
    },
];

export default function LoadingAgent({ onCancel }) {
    const { generationState, resetGeneration } = useStory();
    const { step, stepProgress, error } = generationState;
    const [currentTip, setCurrentTip] = useState(0);

    // Troca a curiosidade a cada 4.5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % STORY_CURIOSITIES.length);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    const handleCancel = () => {
        if (resetGeneration) resetGeneration();
        if (onCancel) onCancel();
    };

    // Tela de Erro Amigável e Tátil
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden bg-[var(--color-bg-primary)] font-body">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-md border-2 border-[#EAE5DC] border-b-4 border-b-[#CDC4B6] flex flex-col items-center text-center relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mb-4">
                        <AlertCircle size={36} />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-slate-800 mb-2">
                        A Magia Encontrou um Desafio
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE5DC]">
                        {error}
                    </p>
                    <button
                        onClick={handleCancel}
                        className="btn-tactile-primary w-full py-3.5 px-6 rounded-full text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        <span>Voltar ao Menu Principal</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body text-slate-700 bg-[var(--color-bg-primary)] select-none">
            {/* Botão Sutil de Cancelar no Topo Direito */}
            <button
                onClick={handleCancel}
                className="fixed top-5 right-5 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-slate-500 hover:text-red-500 border-2 border-[#EAE5DC] hover:border-red-200 shadow-2xs transition-all text-xs font-bold cursor-pointer hover:scale-105 active:scale-95"
                title="Cancelar geração e voltar"
            >
                <X size={15} />
                <span>Cancelar</span>
            </button>

            {/* Background Blobs Animados - Lavanda & Dourado */}
            <div className="bg-blob bg-purple-200 w-[600px] h-[600px] -top-32 -right-32 opacity-35 pointer-events-none" />
            <div className="bg-blob bg-amber-100/70 w-[500px] h-[500px] -bottom-32 -left-32 opacity-35 pointer-events-none" style={{ animationDelay: '3s' }} />

            {/* Ilustração Central do Livro Mágico Encantado */}
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="w-36 h-36 sm:w-44 sm:h-44 relative mb-2 flex items-center justify-center shrink-0"
            >
                <HomeMagicBook />
            </motion.div>

            {/* Título e Curiosidades Rotativas */}
            <div className="text-center max-w-lg mb-5 z-10">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight mb-1.5">
                    Criando seu Livro Mágico
                </h1>
                <div className="h-6 overflow-hidden flex items-center justify-center px-4">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentTip}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="text-xs sm:text-sm text-[#7E57C2] font-semibold flex items-center justify-center gap-1.5 text-center truncate"
                        >
                            <Sparkles size={13} className="shrink-0 text-[#9D7FEA]" />
                            <span className="truncate">{STORY_CURIOSITIES[currentTip]}</span>
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Card Sólido e Tátil: Etapas da Criação (Linha do Tempo Vertical) */}
            <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-full max-w-lg bg-white rounded-3xl border-2 border-[#EAE5DC] border-b-4 border-b-[#CDC4B6] p-5 sm:p-6 shadow-md relative z-10 flex flex-col gap-3.5"
            >
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#EDE7F6] border border-[#D1C4E9] flex items-center justify-center text-[#7E57C2]">
                            <Compass size={17} />
                        </div>
                        <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-heading">
                            Etapas da Criação
                        </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#EDE7F6] border border-[#D1C4E9] text-[#7E57C2] text-xs font-bold">
                        Etapa {Math.min(step + 1, STEPS.length)} de {STEPS.length}
                    </span>
                </div>

                {/* Lista Vertical de Etapas (Sem Cortes de Texto) */}
                <div className="flex flex-col gap-2.5">
                    {STEPS.map((stepData, index) => {
                        const isCompleted = step > index;
                        const isCurrent = step === index;
                        const Icon = stepData.icon;
                        const currentProgress = isCompleted ? 100 : (isCurrent ? stepProgress : 0);

                        return (
                            <div
                                key={stepData.id}
                                className={`p-3 sm:p-3.5 rounded-2xl transition-all border flex items-center gap-3.5 ${
                                    isCurrent
                                        ? 'bg-[#F4EEFD] border-2 border-[#9D7FEA] shadow-2xs'
                                        : isCompleted
                                        ? 'bg-[#FAF8F5] border-[#EAE5DC]'
                                        : 'bg-white border-[#F0ECE1] opacity-60'
                                }`}
                            >
                                {/* Emblema do Passo */}
                                <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center transition-all border ${
                                    isCompleted
                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                                        : isCurrent
                                        ? 'bg-[#9D7FEA] text-white border-[#8364D8] shadow-xs'
                                        : 'bg-[#FAF8F5] text-slate-400 border-[#EAE5DC]'
                                }`}>
                                    {isCompleted ? (
                                        <Check size={20} strokeWidth={3} />
                                    ) : (
                                        <Icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                                    )}
                                </div>

                                {/* Conteúdo Textual da Etapa */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className={`text-sm font-bold truncate ${
                                            isCurrent
                                                ? 'text-slate-900 font-extrabold'
                                                : isCompleted
                                                ? 'text-slate-800'
                                                : 'text-slate-400'
                                        }`}>
                                            {stepData.title}
                                        </h4>

                                        {/* Status ou Porcentagem */}
                                        {isCurrent && (
                                            <span className="text-xs font-extrabold text-[#7E57C2] tabular-nums shrink-0">
                                                {stepProgress}%
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                                                Pronto
                                            </span>
                                        )}
                                    </div>

                                    <p className={`text-xs truncate ${
                                        isCurrent
                                            ? 'text-slate-600 font-medium'
                                            : isCompleted
                                            ? 'text-slate-500'
                                            : 'text-slate-400'
                                    }`}>
                                        {stepData.desc}
                                    </p>

                                    {/* Barra de Progresso em Tempo Real (Apenas para o passo ativo) */}
                                    {isCurrent && (
                                        <div className="w-full h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden mt-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${currentProgress}%` }}
                                                transition={{ duration: 0.4 }}
                                                className="h-full bg-gradient-to-r from-[#9D7FEA] to-[#8364D8] rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
