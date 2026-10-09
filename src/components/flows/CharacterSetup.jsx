import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, ChevronRight, User, Sparkles, Check, Wand2, Plus } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import BackButton from '../ui/BackButton';

export default function CharacterSetup({ onNext, onBack, onStartStory }) {
    const { addCharacter, setSelectedCharacters } = useStory();
    const [nickname, setNickname] = useState('');
    const [characterType, setCharacterType] = useState('person'); // 'person' | 'pet'
    const [speciesBreed, setSpeciesBreed] = useState('');
    const [photos, setPhotos] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSaving, setIsSaving] = useState(null); // null | 'start' | 'another'
    const fileInputRef = useRef(null);

    const compressFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const MAX_DIM = 1024;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_DIM) {
                            height = Math.round((height * MAX_DIM) / width);
                            width = MAX_DIM;
                        }
                    } else {
                        if (height > MAX_DIM) {
                            width = Math.round((width * MAX_DIM) / height);
                            height = MAX_DIM;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
                    resolve({
                        url: compressedDataUrl,
                        file
                    });
                };
                img.onerror = () => {
                    resolve({ url: e.target.result, file });
                };
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 3) {
            alert("Máximo de 3 fotos permitidas.");
            return;
        }

        const compressedResults = await Promise.all(files.map(file => compressFile(file)));
        const validPhotos = compressedResults.filter(Boolean);
        setPhotos([...photos, ...validPhotos]);
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSave = async (actionType = 'start') => {
        if (!nickname.trim()) return;

        setIsSaving(actionType);
        try {
            const savedChar = await addCharacter({
                nickname: nickname.trim(),
                characterType,
                speciesBreed: characterType === 'pet' ? speciesBreed.trim() : null,
                photos: photos.map(p => p.url)
            });

            if (actionType === 'start') {
                if (savedChar && setSelectedCharacters) {
                    setSelectedCharacters([savedChar]);
                }
                if (onStartStory) {
                    onStartStory(savedChar);
                } else {
                    onNext();
                }
            } else {
                // 'another'
                if (savedChar && setSelectedCharacters) {
                    setSelectedCharacters(prev => [...(prev || []), savedChar]);
                }
                setSuccessMessage(`"${nickname.trim()}" foi salvo com sucesso! Cadastre o próximo:`);
                setNickname('');
                setSpeciesBreed('');
                setPhotos([]);
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (error) {
            console.error("Failed to save character:", error);
            alert(`Erro ao salvar personagem: ${error.message}`);
        } finally {
            setIsSaving(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8 relative bg-[var(--color-bg-primary)] overflow-x-hidden">
            {/* Background Blobs */}
            <div className="bg-blob bg-pink-100 w-[500px] h-[500px] -top-20 -left-20" />
            <div className="bg-blob bg-emerald-100 w-[400px] h-[400px] -bottom-20 -right-20" />

            <BackButton onClick={onBack} label="Voltar" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-lg p-8 rounded-[32px] space-y-6 relative z-10"
            >
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-pink-50 rounded-full mb-2">
                        <User className="text-magic-pink" size={24} />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-slate-800">
                        Quem será o Herói?
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Cadastre uma pessoa real ou o seu pet para estrelar a aventura!
                    </p>
                </div>

                {/* Banner de feedback quando cria mais um */}
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Check size={16} className="text-emerald-500 shrink-0" />
                        <span>{successMessage}</span>
                    </motion.div>
                )}

                {/* Seletor Pessoa vs Pet */}
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
                    <button
                        type="button"
                        onClick={() => setCharacterType('person')}
                        className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            characterType === 'person'
                                ? 'bg-white text-magic-pink shadow-sm scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span>🧒</span> Pessoa
                    </button>
                    <button
                        type="button"
                        onClick={() => setCharacterType('pet')}
                        className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            characterType === 'pet'
                                ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <span>🐾</span> Pet / Animal
                    </button>
                </div>

                {/* Nickname Input */}
                <div className="text-left space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-4">
                        {characterType === 'pet' ? 'Nome do Pet' : 'Nome do Herói'}
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder={characterType === 'pet' ? "Ex: Lili, Thor, Pipoca" : "Ex: Super Lucas, Sofia"}
                            className="magic-input pl-6 text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                        <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-magic-pink transition-colors pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Species / Breed Input (Only for Pets) */}
                {characterType === 'pet' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-left space-y-2"
                    >
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-4">
                            Espécie / Raça do Pet
                        </label>
                        <input
                            type="text"
                            value={speciesBreed}
                            onChange={(e) => setSpeciesBreed(e.target.value)}
                            placeholder="Ex: Cachorro Golden Retriever, Gato Siamês, Vira-lata"
                            className="magic-input pl-6 text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                    </motion.div>
                )}

                {/* Photo Upload */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fotos de Referência ({photos.length}/3)</label>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Rosto claro e iluminado</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white/50 shadow-sm group">
                                <img src={photo.url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                    <X className="text-white bg-red-400 rounded-full p-1" size={24} />
                                </button>
                            </div>
                        ))}

                        {photos.length < 3 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-pink-200 hover:border-magic-pink hover:bg-pink-50 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer bg-white/30"
                            >
                                <Camera className="text-pink-300 group-hover:text-magic-pink transition-colors" />
                                <span className="text-xs text-pink-300 group-hover:text-magic-pink font-bold">Adicionar</span>
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                </div>

                {/* Submit Actions */}
                <div className="space-y-3 pt-2">
                    {/* Botão Primário: Salvar e Gerar História */}
                    <button
                        type="button"
                        onClick={() => handleSave('start')}
                        disabled={!nickname.trim() || !!isSaving}
                        className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold transition-all shadow-lg text-base cursor-pointer
                            ${nickname.trim() && !isSaving
                                ? 'bg-gradient-to-r from-magic-pink to-magic-emerald text-white hover:scale-[1.02] hover:shadow-pink-200 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isSaving === 'start' ? (
                            <span>Salvando e iniciando...</span>
                        ) : (
                            <>
                                <span>Salvar e Começar História</span>
                                <Wand2 size={20} />
                            </>
                        )}
                    </button>

                    {/* Botão Secundário: Salvar e Criar Mais Um */}
                    <button
                        type="button"
                        onClick={() => handleSave('another')}
                        disabled={!nickname.trim() || !!isSaving}
                        className={`w-full py-3.5 rounded-full flex items-center justify-center gap-2 font-bold transition-all border text-sm cursor-pointer
                            ${nickname.trim() && !isSaving
                                ? 'bg-white border-pink-200 text-slate-700 hover:border-magic-pink hover:text-magic-pink hover:bg-pink-50/40 shadow-sm'
                                : 'bg-white/50 border-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isSaving === 'another' ? (
                            <span>Salvando herói...</span>
                        ) : (
                            <>
                                <Plus size={18} className="text-magic-pink" />
                                <span>Salvar e Criar Mais Um</span>
                            </>
                        )}
                    </button>

                    {/* Atalho para Seleção/Galeria */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={onNext}
                            className="text-xs font-bold text-slate-400 hover:text-magic-pink transition-colors cursor-pointer"
                        >
                            Ou ver todos os heróis cadastrados →
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
