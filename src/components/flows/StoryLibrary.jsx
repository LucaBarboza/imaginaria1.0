import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Book, Trash2, Calendar, Sparkles, Share2, Check } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import BookResult from './BookResult';
import BackButton from '../ui/BackButton';

export default function StoryLibrary({ onBack }) {
    const { currentUser } = useAuth();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [copiedStoryId, setCopiedStoryId] = useState(null);

    useEffect(() => {
        async function fetchStories() {
            setLoading(true);
            setErrorMsg(null);
            const loadedStories = [];

            // 1. Fetch Local Stories (Skipped - Firebase Only Request)
            // Local fetching removed to restrict view to cloud stories only

            // 2. Fetch Firebase Stories (If Logged In)
            if (currentUser) {
                try {
                    const q = query(
                        collection(db, "users", currentUser.uid, "stories"),
                        orderBy("createdAt", "desc")
                    );

                    const querySnapshot = await getDocs(q);
                    const firebaseStories = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        isLocal: false
                    }));

                    loadedStories.push(...firebaseStories);
                } catch (error) {
                    console.error("Error fetching firebase stories:", error);
                    setErrorMsg("Houve um problema ao carregar as histórias: " + error.message + (error.message.includes('index') ? " (Parece faltar um índice no Firebase, abra o console para pegar o link!)" : ""));
                }
            }

            // Deduplicate by ID (prefer Firebase if both exist, or handle collision)
            // Simple approach: just show all, relying on unique IDs
            setStories(loadedStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setLoading(false);
        }

        fetchStories();
    }, [currentUser]);

    const deleteFolderRecursively = async (folderRef) => {
        try {
            const { items, prefixes } = await listAll(folderRef);

            // Delete all files in this folder
            const deletePromises = items.map(itemRef => deleteObject(itemRef));

            // Recursively delete subfolders
            const subfolderPromises = prefixes.map(prefixRef => deleteFolderRecursively(prefixRef));

            await Promise.all([...deletePromises, ...subfolderPromises]);
        } catch (err) {
            console.error("Error deleting folder or subfolder items:", folderRef, err);
        }
    };

    const handleDelete = async (e, storyId) => {
        e.stopPropagation();
        if (!window.confirm("Tem certeza que deseja apagar esta história para sempre? (Isso também apagará as imagens e logs salvos)")) return;

        // Try Firebase delete if logged in
        if (currentUser) {
            try {
                // Remove from Firestore Database
                await deleteDoc(doc(db, "users", currentUser.uid, "stories", storyId));

                // Remove from Firebase Storage
                const storyStorageRef = ref(storage, `users/${currentUser.uid}/stories/${storyId}`);
                await deleteFolderRecursively(storyStorageRef);

            } catch (error) {
                console.error("Error deleting story from DB or Storage:", error);
            }
        }
        setStories(prev => prev.filter(s => s.id !== storyId));
    };

    const handleShareStory = async (e, story) => {
        e.stopPropagation();
        const userId = currentUser?.uid;
        if (!story.id || !userId) return;

        const shareUrl = `${window.location.origin}/?storyId=${story.id}&userId=${userId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: story.title || 'Maginária - Livro Mágico',
                    text: `Leia esta história mágica: "${story.title}"`,
                    url: shareUrl
                });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedStoryId(story.id);
            setTimeout(() => setCopiedStoryId(null), 2500);
        } catch (err) {
            prompt("Copie o link abaixo para compartilhar:", shareUrl);
        }
    };

    const handleOpenStory = async (story) => {
        // Local details fetch removed - Firebase Only
        let fullStory = story;

        // Adapt Firestore/Local structure to BookResult structure
        // Local backend returns 'chapters' with 'image' (not image_url)
        // Firestore returns 'chapters' with 'image_url'
        const rawChapters = fullStory.chapters || [];
        const adapted = {
            id: fullStory.id,
            storyId: fullStory.id,
            userId: currentUser?.uid,
            title: fullStory.title,
            cover_image: fullStory.cover_image || fullStory.cover_image_url,
            cover_prompt: fullStory.cover_prompt || fullStory.metadata?.cover_prompt || '',
            pages: fullStory.pages || rawChapters.map(c => ({ text: c.text, illustration_prompt: c.prompt || "" })),
            parts: fullStory.parts || rawChapters.map(c => [c.text, c.prompt || ""]),
            chapters: rawChapters.map(c => ({ image_url: c.image_url || c.image })),
            cost_data: fullStory.cost_data || null,
            universe: fullStory.universe || fullStory.metadata?.inputs?.universe,
            style: fullStory.style || fullStory.metadata?.inputs?.style,
            character_names: fullStory.character_names || fullStory.metadata?.inputs?.names,
            clothing_bible: fullStory.clothing_bible || fullStory.metadata?.clothing_bible,
            character_appearance_bible: fullStory.character_appearance_bible || fullStory.metadata?.character_appearance_bible,
            character_details: fullStory.character_details || fullStory.metadata?.character_details,
            url_photos: fullStory.url_photos || fullStory.metadata?.url_photos,
            metadata: fullStory.metadata
        };
        setSelectedStory(adapted);
    };

    if (selectedStory) {
        return <BookResult story={selectedStory} onClose={() => setSelectedStory(null)} />;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-6 relative overflow-hidden font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Background Blobs Animados - Consistente com Home */}
            <div className="bg-blob bg-pink-200 w-[600px] h-[600px] -top-32 -right-32 opacity-40" />
            <div className="bg-blob bg-emerald-100 w-[500px] h-[500px] -bottom-32 -left-32 opacity-40" style={{ animationDelay: '3s' }} />

            <BackButton onClick={onBack} />

            <main className="z-10 w-full max-w-6xl flex flex-col items-center gap-8 mt-12 md:mt-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm mb-6 border border-white/50">
                        <Sparkles size={16} className="text-magic-pink" />
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-widest font-heading">
                            Acervo de Histórias
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold font-heading text-slate-800 mb-6 leading-tight">
                        Minha <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-magic-emerald">Biblioteca</span>
                    </h2>


                </motion.div>

                {errorMsg && (
                    <div className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/50 mb-6 text-center">
                        <p>{errorMsg}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                        <Book size={64} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-medium text-slate-400">Nenhuma história encontrada</h3>
                        <p className="text-slate-500 mt-2">Crie sua primeira aventura para vê-la aqui!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {stories.map((story) => (
                                <motion.div
                                    key={story.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => handleOpenStory(story)}
                                    className="group relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 border border-slate-700 hover:border-purple-500/50"
                                >
                                    {/* Cover Image */}
                                    <div className="aspect-[2/3] w-full relative overflow-hidden">
                                        <img
                                            src={story.cover_image_url}
                                            alt={story.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                                        {/* Date Badge */}
                                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] text-slate-300 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(story.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 w-full p-4 space-y-1">
                                        <h3 className="font-serif font-bold text-lg text-white leading-tight line-clamp-2 group-hover:text-yellow-200 transition-colors">
                                            {story.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-1">
                                            {story.chapters?.length || 0} capítulos
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
                                        <button
                                            onClick={(e) => handleShareStory(e, story)}
                                            className="p-2 bg-purple-600/90 hover:bg-purple-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Compartilhar link da história"
                                        >
                                            {copiedStoryId === story.id ? <Check size={16} className="text-emerald-300" /> : <Share2 size={16} />}
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, story.id)}
                                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Apagar história"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div >
    );
}
