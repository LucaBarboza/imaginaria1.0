import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, User, Sparkles, Check, Wand2 } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import BackButton from '../ui/BackButton';

export default function CharacterSelector({ onNext, onBack, onCreateNew, mode = 'selection' }) {
    const { characters, selectCharacter, deleteCharacter, selectedCharacters } = useStory();

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
        <div className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center p-4 sm:p-6 relative font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Background Blobs Animados - Harmonizados com a Paleta Lavanda */}
            <div className="bg-blob bg-purple-200 w-[600px] h-[600px] -top-32 -right-32 opacity-40 pointer-events-none" />
            <div className="bg-blob bg-amber-100/70 w-[500px] h-[500px] -bottom-32 -left-32 opacity-40 pointer-events-none" style={{ animationDelay: '3s' }} />

            {/* Back Button */}
            <BackButton onClick={onBack} />

            <main className="z-10 w-full max-w-6xl flex flex-col items-center gap-6 mt-14 md:mt-6 pb-48 sm:pb-36">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-2"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-xs mb-4 border-2 border-[#EAE5DC]">
                        <Sparkles size={16} className="text-[#9D7FEA]" />
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-widest font-heading">
                            {mode === 'gallery' ? 'Galeria de Heróis' : 'Seleção de Personagem'}
                        </span>
                        {selectedCharacters.length > 0 && (
                            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-[#EDE7F6] border border-[#D1C4E9] text-[#7E57C2] text-xs font-bold">
                                {selectedCharacters.length} de 3 selecionados
                            </span>
                        )}
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-800 mb-3 leading-tight">
                        {mode === 'gallery' ? (
                            <>Seus <span className="text-[#9D7FEA]">Protagonistas</span></>
                        ) : (
                            <>Quem viverá esta <br /><span className="text-[#9D7FEA]">Aventura?</span></>
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
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleCharacterSelect(char)}
                                    className={`relative w-72 aspect-[3/4] rounded-[2rem] overflow-hidden group border-3 transition-all duration-300 cursor-pointer touch-pan-y bg-white ${
                                        isSelected
                                            ? 'border-[#9D7FEA] shadow-md shadow-purple-200/50 scale-[1.02]'
                                            : 'border-[#EAE5DC] hover:border-[#9D7FEA]/50 hover:scale-[1.01] shadow-xs'
                                    }`}
                                >
                                    {/* Badge Selecionado */}
                                    {isSelected && (
                                        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#9D7FEA] text-white text-[11px] font-bold shadow-xs flex items-center gap-1">
                                            <Check size={12} strokeWidth={3} />
                                            <span>Selecionado</span>
                                        </div>
                                    )}

                                    {/* Character Image / Avatar */}
                                    <div className="absolute inset-3 bottom-16 rounded-[1.5rem] overflow-hidden bg-slate-50 relative shadow-inner">
                                        {(char.avatar || (char.photos && char.photos[0])) ? (
                                            <img
                                                src={char.avatar || char.photos[0]}
                                                alt={char.name || char.nickname}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-purple-200 bg-purple-50/40">
                                                <User size={80} strokeWidth={1} />
                                            </div>
                                        )}

                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>

                                    {/* Content Info */}
                                    <div className="absolute bottom-0 left-0 w-full h-14 flex flex-col justify-center items-center text-center px-4 z-10 bg-white border-t border-[#EAE5DC]">
                                        <h3 className="text-xl font-bold text-slate-800 font-heading transition-colors truncate w-full group-hover:text-[#9D7FEA]">
                                            {char.name || char.nickname}
                                        </h3>
                                    </div>

                                    {/* Delete Button - Visível no hover no desktop */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(e, char.id)}
                                        className="absolute top-4 right-4 p-2.5 bg-white rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 shadow-sm transition-all border border-red-100 z-30 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                        title="Excluir Herói"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Create New Card */}
                    <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: characters.length * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCreateNew}
                        className="w-72 aspect-[3/4] rounded-[2rem] border-2 border-dashed border-[#EAE5DC] hover:border-[#9D7FEA] bg-white flex flex-col items-center justify-center gap-6 group cursor-pointer transition-all shadow-xs hover:shadow-sm touch-pan-y"
                    >
                        <div className="relative pointer-events-none">
                            <div className="p-6 rounded-full bg-[#F4EEFD] border border-[#EAE5DC] group-hover:scale-105 transition-all text-[#9D7FEA]">
                                <Plus size={40} />
                            </div>
                        </div>
                        <div className="text-center pointer-events-none">
                            <span className="block text-xl font-bold font-heading text-slate-500 group-hover:text-[#9D7FEA] transition-colors">
                                Novo Herói
                            </span>
                            <span className="text-sm text-slate-400 group-hover:text-purple-400/80 transition-colors">
                                Crie uma nova lenda
                            </span>
                        </div>
                    </motion.button>
                </div>
            </main>

            {/* Sticky Action Footer Bar - Centralizado, Limpo e Sólido */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#EAE5DC] px-4 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] shadow-md flex justify-center items-center">
                <button
                    type="button"
                    onClick={onNext}
                    disabled={selectedCharacters.length === 0}
                    className={`px-10 py-3.5 rounded-full font-bold text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md ${
                        selectedCharacters.length > 0
                            ? 'btn-tactile-primary'
                            : 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed opacity-75'
                    }`}
                >
                    <Wand2 size={20} />
                    <span>
                        {selectedCharacters.length > 0
                            ? 'Gerar História'
                            : 'Selecione um herói para continuar'}
                    </span>
                    {selectedCharacters.length > 0 && (
                        <span className="w-6 h-6 rounded-full bg-white/30 text-white text-xs flex items-center justify-center font-bold">
                            {selectedCharacters.length}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
