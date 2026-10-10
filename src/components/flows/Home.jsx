import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, User, Library, Star, Plus, Users } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import { useAuth } from '../../context/AuthContext';
import HomeMagicBook from '../illustrations/HomeMagicBook';

export default function Home({ onCreateCharacter, onStartStory, onOpenLibrary, onOpenHeroes, onLogin, onOpenShop }) {
    const { characters } = useStory();
    const { logout, currentUser } = useAuth();
    const hasCharacters = characters.length > 0;

    return (
        <div className="min-h-screen w-full flex flex-col p-4 md:p-6 relative overflow-hidden font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Background Blobs Animados - Harmonizados com a Paleta Lavanda & Dourado */}
            <div className="bg-blob bg-purple-200 w-[500px] h-[500px] -top-20 -left-20" />
            <div className="bg-blob bg-amber-100/70 w-[400px] h-[400px] -bottom-20 -right-20" style={{ animationDelay: '2s' }} />

            {/* Header */}
            <header className="w-full flex justify-between items-start z-20 max-w-7xl mx-auto mb-2 lg:mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-[#EAE5DC] shadow-xs flex items-center justify-center text-[#9D7FEA] mt-1">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight font-heading mt-2">Maginária</span>
                </div>

                <div className="flex items-start gap-4">
                    {currentUser ? (
                        <>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-full shadow-xs border-2 border-[#EAE5DC]">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="User" className="w-8 h-8 rounded-full border-2 border-[#9D7FEA] p-0.5" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-xs font-bold text-[#9D7FEA] border-2 border-[#9D7FEA] p-0.5">
                                            {currentUser.displayName?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold text-slate-700 hidden md:block font-heading">
                                        {currentUser.displayName?.split(' ')[0]}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-slate-400 hover:text-[#9D7FEA] transition-colors mt-3 cursor-pointer"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onLogin}
                            className="px-5 py-2 bg-white text-[#9D7FEA] font-bold rounded-full shadow-xs hover:border-[#9D7FEA] transition-all text-sm border-2 border-[#EAE5DC] flex items-center gap-2 cursor-pointer"
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
                            <span className="text-[#9D7FEA]">histórias eternas.</span>
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
                <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-3 lg:gap-4 pt-4 lg:pt-6">

                    {/* Botão Auxiliar 1: Meus Heróis */}
                    <div className="w-full md:flex-1 flex justify-end">
                        <div className="w-full max-w-sm">
                            <MagicCard
                                title="Meus Heróis"
                                description="Sua Galeria"
                                icon={<Users className="w-6 h-6 lg:w-7 lg:h-7 text-[#7E57C2]" strokeWidth={2.4} />}
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
                                : (!hasCharacters ? "Criar Primeiro Herói" : "Começar Jornada");

                            return (
                                <button
                                    onClick={handleClick}
                                    className="text-lg lg:text-xl px-7 py-3.5 lg:px-9 lg:py-4 rounded-full w-full md:w-auto flex items-center justify-center gap-3 btn-tactile-primary shadow-lg cursor-pointer"
                                >
                                    <Sparkles size={24} className="text-white" />
                                    <div className="flex flex-col items-start">
                                        <span className="font-bold font-heading whitespace-nowrap text-white">
                                            {label}
                                        </span>
                                        {currentUser && (
                                            <div className="flex items-center gap-1 mt-0.5 opacity-90">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-100">
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
                                icon={<BookOpen className="w-6 h-6 lg:w-7 lg:h-7 text-[#7E57C2]" strokeWidth={2.4} />}
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

const MagicCard = ({ title, description, icon, onClick, delay }) => {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full bg-white rounded-3xl border-2 border-[#D8D0C5] border-b-4 border-b-[#CDC4B6] hover:border-[#8364D8] hover:border-b-[#6C42C7] p-4 lg:p-5 flex flex-row items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all text-left group"
        >
            <div className="relative z-10 flex-1 pr-4">
                <h3 className="font-extrabold text-slate-900 group-hover:text-[#6C42C7] transition-colors font-heading text-lg lg:text-xl mb-0.5 tracking-tight truncate">
                    {title}
                </h3>
                <p className="text-slate-600 font-bold text-xs lg:text-sm truncate">{description}</p>
            </div>

            <div className="relative z-10 flex flex-shrink-0 items-center justify-center rounded-2xl bg-[#EDE7F6] border-2 border-[#D1C4E9] w-12 h-12 lg:w-14 lg:h-14 transition-transform group-hover:scale-105 shadow-2xs">
                {icon}
            </div>
        </motion.button>
    );
};
