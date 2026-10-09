import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, Sparkles, Check, Wand2 } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import BackButton from '../ui/BackButton';

export default function CharacterSelector({ onNext, onBack, onCreateNew, mode = 'selection' }) {
    const { characters, selectCharacter, deleteCharacter, selectedCharacters } = useStory();
    const [hoveredId, setHoveredId] = useState(null);

    const handleCharacterSelect = (char) => {
        selectCharacter(char.id);
    };

    const handleDelete = (e, charId) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja dizer adeus a este herói?')) {
            deleteCharacter(charId);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-6 relative overflow-x-hidden font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Background Blobs Animados - Consistente com Home */}
            <div className="bg-blob bg-pink-200 w-[600px] h-[600px] -top-32 -right-32 opacity-40" />
            <div className="bg-blob bg-emerald-100 w-[500px] h-[500px] -bottom-32 -left-32 opacity-40" style={{ animationDelay: '3s' }} />

            {/* Back Button */}
            <BackButton onClick={onBack} />

            <main className="z-10 w-full max-w-6xl flex flex-col items-center gap-6 mt-14 md:mt-6 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-2"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm mb-4 border border-white/50">
                        <Sparkles size={16} className="text-magic-pink" />
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-widest font-heading">
                            {mode === 'gallery' ? 'Galeria de Heróis' : 'Seleção de Personagem'}
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-800 mb-3 leading-tight">
                        {mode === 'gallery' ? (
                            <>Seus <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-magic-emerald">Protagonistas</span></>
                        ) : (
                            <>Quem viverá esta <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-magic-emerald">Aventura?</span></>
                        )}
                    </h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        {mode === 'gallery'
                            ? "Seus heróis cadastrados."
                            : "Selecione até 3 heróis para viverem esta jornada juntos."}
                    </p>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-8 w-full">
                    <AnimatePresence mode="popLayout">
                        {characters.map((char, index) => {
                            const isSelected = selectedCharacters.some(c => c.id === char.id);
                            return (
                                <motion.div
                                    key={char.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    onHoverStart={() => setHoveredId(char.id)}
                                    onHoverEnd={() => setHoveredId(null)}
                                    onClick={() => handleCharacterSelect(char)}
                                    className={`relative w-72 aspect-[3/4] rounded-[2rem] overflow-hidden group border-4 transition-all duration-300 cursor-pointer ${
                                        isSelected
                                            ? 'border-magic-pink shadow-[0_10px_30px_-10px_rgba(236,72,153,0.5)] scale-[1.02]'
                                            : 'border-transparent hover:border-magic-pink/30 hover:shadow-[0_20px_40px_-12px_rgba(236,72,153,0.3)] shadow-sm'
                                    }`}
                                >
                                    {/* Badge Selecionado */}
                                    {isSelected && (
                                        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-magic-pink text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                                            <Check size={12} strokeWidth={3} />
                                            <span>Selecionado</span>
                                        </div>
                                    )}

                                    {/* Character Image / Avatar */}
                                    <div className="absolute inset-3 bottom-16 rounded-[1.5rem] overflow-hidden bg-slate-100 relative shadow-inner">
                                        {(char.avatar || (char.photos && char.photos[0])) ? (
                                            <img
                                                src={char.avatar || char.photos[0]}
                                                alt={char.name || char.nickname}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-pink-200 bg-pink-50/50">
                                                <User size={80} strokeWidth={1} />
                                            </div>
                                        )}

                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content Info */}
                                    <div className="absolute bottom-0 left-0 w-full h-14 flex flex-col justify-center items-center text-center px-4 z-10 bg-white/60 backdrop-blur-sm border-t border-white/60">
                                        <h3 className="text-xl font-bold text-slate-800 font-heading transition-colors truncate w-full group-hover:text-magic-pink">
                                            {char.name || char.nickname}
                                        </h3>
                                    </div>

                                    {/* Delete Button - Appears on Hover */}
                                    <AnimatePresence>
                                        {hoveredId === char.id && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                onClick={(e) => handleDelete(e, char.id)}
                                                className="absolute top-4 right-4 p-2.5 bg-white/95 rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 shadow-md hover:shadow-xl transition-all border border-red-100 z-30"
                                                title="Excluir Herói"
                                            >
                                                <Trash2 size={16} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Create New Card */}
                    <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: characters.length * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCreateNew}
                        className="w-72 aspect-[3/4] rounded-[2rem] border-3 border-dashed border-pink-200/70 hover:border-magic-pink hover:bg-pink-50/40 flex flex-col items-center justify-center gap-6 group cursor-pointer transition-all bg-white/20 backdrop-blur-sm"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-magic-pink blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                            <div className="relative p-6 rounded-full bg-white shadow-sm border border-pink-100 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300 text-pink-300 group-hover:text-magic-pink">
                                <Plus size={40} />
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="block text-xl font-bold font-heading text-slate-400 group-hover:text-magic-pink transition-colors">
                                Novo Herói
                            </span>
                            <span className="text-sm text-slate-400/70 group-hover:text-pink-400/70 transition-colors">
                                Crie uma nova lenda
                            </span>
                        </div>
                    </motion.button>
                </div>
            </main>

            {/* Sticky Action Footer Bar - Sempre visível lá embaixo */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Info / Counter */}
                    <div className="text-center sm:text-left">
                        {selectedCharacters.length === 0 ? (
                            <div className="flex items-center gap-2 text-slate-500 text-xs sm:text-sm font-medium">
                                <Sparkles size={16} className="text-magic-pink shrink-0" />
                                <span>Selecione até 3 heróis para viverem esta jornada juntos.</span>
                            </div>
                        ) : (
                            <div className="text-xs sm:text-sm">
                                <span className="font-bold text-slate-700">
                                    {selectedCharacters.length} herói{selectedCharacters.length > 1 ? 's' : ''} selecionado{selectedCharacters.length > 1 ? 's' : ''}:
                                </span>{' '}
                                <span className="text-magic-pink font-semibold">
                                    {selectedCharacters.map(c => c.name || c.nickname).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={selectedCharacters.length === 0}
                        className={`px-8 py-3 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                            selectedCharacters.length > 0
                                ? 'bg-gradient-to-r from-magic-pink to-magic-emerald text-white hover:scale-105 hover:shadow-pink-200 active:scale-95 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                        }`}
                    >
                        <span>
                            {selectedCharacters.length > 0
                                ? `Gerar História (${selectedCharacters.length})`
                                : 'Selecione um herói para continuar'}
                        </span>
                        <Wand2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
