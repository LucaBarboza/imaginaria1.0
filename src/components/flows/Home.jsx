import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, User, Library, Star, Plus } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import { useAuth } from '../../context/AuthContext';
import HomeMagicBook from '../illustrations/HomeMagicBook';
import { SparklesIconPremium, HeroGalleryIconPremium, LibraryIconPremium } from '../illustrations/HomeActionIcons';

export default function Home({ onCreateCharacter, onStartStory, onOpenLibrary, onOpenHeroes, onLogin, onOpenShop }) {
    const { characters } = useStory();
    const { logout, currentUser } = useAuth();
    const hasCharacters = characters.length > 0;

    return (
        <div className="min-h-screen w-full flex flex-col p-4 md:p-6 relative overflow-hidden font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Background Blobs Animados */}
            <div className="bg-blob bg-pink-200 w-[500px] h-[500px] -top-20 -left-20" />
            <div className="bg-blob bg-emerald-100 w-[400px] h-[400px] -bottom-20 -right-20" style={{ animationDelay: '2s' }} />

            {/* Header */}
            <header className="w-full flex justify-between items-start z-20 max-w-7xl mx-auto mb-2 lg:mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md shadow-sm flex items-center justify-center text-magic-pink mt-1">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight font-heading mt-2">Imaginaria</span>
                </div>

                <div className="flex items-start gap-4">
                    {currentUser ? (
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-white/50">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full border-2 border-emerald-400 p-0.5" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-500 border-2 border-emerald-400 p-0.5">
                                            {currentUser.displayName?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold text-slate-600 hidden md:block font-heading">
                                        {currentUser.displayName?.split(' ')[0]}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-slate-400 hover:text-magic-pink transition-colors mt-3"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onLogin}
                            className="px-5 py-2 bg-white/80 backdrop-blur-md text-magic-pink font-bold rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all text-sm border border-white/50 flex items-center gap-2"
                        >
                            <User size={16} /> Entrar
                        </button>
                    )}
                </div>
            </header>

            {/* Conteúdo Principal */}
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-center z-10 gap-0 lg:gap-2">

                {/* Top Section: Hero Text (Left) & Illustration (Right) */}
                <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-5xl gap-2 lg:gap-8">

                    {/* Left Side: Typography */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-2 lg:space-y-4 flex-1"
                    >
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading text-slate-800 leading-tight">
                            Suas fotos,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-magic-emerald">histórias eternas.</span>
                        </h1>

                        <p className="text-sm md:text-base lg:text-lg text-slate-500 max-w-lg font-body leading-relaxed mx-auto lg:mx-0">
                            Entre em portais mágicos onde você é o protagonista da sua própria aventura épica.
                        </p>
                    </motion.div>

                    {/* Right Side: Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 relative flex-shrink-0"
                    >
                        <HomeMagicBook />
                    </motion.div>
                </div>

                {/* Botões de Ação (Bottom Section) */}
                <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-3 lg:gap-4 pt-2 lg:pt-4">

                    {/* Botão Auxiliar 1: Meus Heróis */}
                    <div className="w-full md:flex-1 flex justify-end">
                        <div className="w-full max-w-sm">
                            <MagicCard
                                title="Meus Heróis"
                                description="Sua Galeria"
                                icon={<HeroGalleryIconPremium className="w-6 h-6 lg:w-8 lg:h-8 drop-shadow-md" />}
                                color="rose"
                                onClick={currentUser ? onOpenHeroes : onLogin}
                                delay={0.2}
                            />
                        </div>
                    </div>

                    {/* Botão Principal: Nova Aventura */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="w-full md:w-auto flex-shrink-0 z-10"
                    >
                        {(() => {
                            const handleClick = () => {
                                if (!currentUser) {
                                    onLogin?.();
                                } else if (!hasCharacters) {
                                    onCreateCharacter?.();
                                } else {
                                    onStartStory?.();
                                }
                            };

                            const label = !currentUser
                                ? "Faça login"
                                : (!hasCharacters ? "Criar Meu Primeiro Herói" : "Começar Jornada");

                            return (
                                <button
                                    onClick={handleClick}
                                    className="text-lg lg:text-xl px-6 py-3 lg:px-8 lg:py-4 rounded-full w-full md:w-auto flex items-center justify-center gap-3 border-4 transition-all duration-300 btn-magic shadow-xl shadow-pink-300/50 border-white/30 hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <Sparkles size={24} className="text-white drop-shadow-md" />
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold font-heading whitespace-nowrap text-white drop-shadow-sm">
                                            {label}
                                        </span>
                                        {currentUser && (
                                            <div className="flex items-center gap-1 mt-0.5 opacity-90">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-pink-100">
                                                    {hasCharacters ? "Começar Aventura" : "Foto ou Pet"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })()}
                    </motion.div>

                    {/* Botão Auxiliar 2: Biblioteca */}
                    <div className="w-full md:flex-1 flex justify-start">
                        <div className="w-full max-w-sm">
                            <MagicCard
                                title="Biblioteca"
                                description="Contos passados"
                                icon={<LibraryIconPremium className="w-6 h-6 lg:w-8 lg:h-8 drop-shadow-md" />}
                                color="emerald"
                                onClick={currentUser ? onOpenLibrary : onLogin}
                                delay={0.4}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const MagicCard = ({ title, description, icon, color, onClick, delay }) => {
    const colors = {
        pink: 'from-magic-pink to-rose-400',
        rose: 'from-rose-400 to-orange-300',
        emerald: 'from-magic-emerald to-teal-400'
    };

    const gradient = colors[color] || colors.pink;

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative group w-full overflow-hidden rounded-3xl text-left transition-all duration-300 bg-white border-2 border-slate-100 hover:border-slate-200 p-4 lg:p-5 flex flex-row items-center justify-between cursor-pointer shadow-md hover:shadow-lg`}
        >
            <div className={`absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-15 transition-all rounded-full blur-3xl translate-x-1/2 -translate-y-1/2`} />

            <div className={`relative z-10 flex-1 pr-4`}>
                <h3 className={`font-bold text-slate-700 font-heading group-hover:text-magic-pink transition-colors text-lg lg:text-xl mb-1 truncate`}>
                    {title}
                </h3>
                <p className="text-slate-400 text-xs lg:text-sm truncate">{description}</p>
            </div>

            <div className={`relative z-10 flex flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-md group-hover:scale-110 transition-transform duration-300 w-12 h-12 lg:w-14 lg:h-14 order-2`}>
                {icon}
            </div>
        </motion.button>
    );
};
