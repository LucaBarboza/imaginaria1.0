import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, ChevronRight, User, Sparkles } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import BackButton from '../ui/BackButton';

export default function CharacterSetup({ onNext, onBack }) {
    const { addCharacter } = useStory();
    const [nickname, setNickname] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 3) {
            alert("Máximo de 3 fotos permitidas.");
            return;
        }

        const newPhotos = await Promise.all(files.map(async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        url: reader.result, // Base64 Data URL
                        file
                    });
                };
                reader.readAsDataURL(file);
            });
        }));

        setPhotos([...photos, ...newPhotos]);
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!nickname.trim()) return;

        setIsSaving(true);
        try {
            await addCharacter({
                nickname,
                photos: photos.map(p => p.url)
            });
            onNext();
        } catch (error) {
            console.error("Failed to save character:", error);
            alert(`Erro ao salvar personagem: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8 relative bg-[var(--color-bg-primary)] overflow-hidden">
            {/* Background Blobs */}
            <div className="bg-blob bg-pink-100 w-[500px] h-[500px] -top-20 -left-20" />
            <div className="bg-blob bg-emerald-100 w-[400px] h-[400px] -bottom-20 -right-20" />

            <BackButton onClick={onBack} label="Voltar" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-lg p-8 rounded-[32px] space-y-8 relative z-10"
            >
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-pink-50 rounded-full mb-4">
                        <User className="text-magic-pink" size={24} />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-slate-800">
                        Quem será o Herói?
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Para a IA desenhar você na história, precisamos de algumas referências.
                    </p>
                </div>

                {/* Nickname Input */}
                <div className="text-left space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Nome do Herói</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Ex: Super Lucas"
                            className="magic-input pl-6"
                        />
                        <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-200 group-focus-within:text-magic-pink transition-colors pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fotos de Referência ({photos.length}/3)</label>
                        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded-full">Rosto claro e iluminado</span>
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

                {/* Submit Action */}
                <button
                    onClick={handleSubmit}
                    disabled={!nickname.trim() || isSaving}
                    className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-bold transition-all shadow-lg
                        ${nickname.trim() && !isSaving
                            ? 'bg-gradient-to-r from-magic-pink to-rose-400 text-white hover:scale-[1.02] hover:shadow-pink-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                    {isSaving ? (
                        <span>Salvando...</span>
                    ) : (
                        <>
                            <span>Criar Personagem</span>
                            <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
