import { useState, useEffect } from 'react';
import { StoryProvider, useStory } from './context/StoryContext';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import CharacterSelector from './components/flows/CharacterSelector';
import LoadingAgent from './components/flows/LoadingAgent';
import BookResult from './components/flows/BookResult';
import StoryWizard from './components/flows/StoryWizard';
import Login from './components/flows/Login';

import Home from './components/flows/Home';
import CharacterSetup from './components/flows/CharacterSetup';
import StoryLibrary from './components/flows/StoryLibrary';
import Shop from './components/flows/Shop';
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';


function AppContent() {
    const { currentUser } = useAuth();
    const { startGeneration, generationState, resetGeneration } = useStory();
    const [view, setView] = useState('HOME');
    const [sharedStory, setSharedStory] = useState(null);
    const [loadingShared, setLoadingShared] = useState(false);

    // Scroll to top on view change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    // Check URL parameters for shared story links (?storyId=...&userId=...)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const storyId = params.get('storyId') || params.get('story');
        const userId = params.get('userId') || params.get('user');

        if (storyId && userId) {
            setLoadingShared(true);
            const fetchShared = async () => {
                try {
                    const docRef = doc(db, "users", userId, "stories", storyId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const rawChapters = data.chapters || [];
                        const adapted = {
                            id: docSnap.id,
                            storyId: docSnap.id,
                            userId: userId,
                            title: data.title,
                            cover_image: data.cover_image || data.cover_image_url,
                            cover_prompt: data.cover_prompt || data.metadata?.cover_prompt || '',
                            pages: data.pages || rawChapters.map(c => ({ text: c.text, illustration_prompt: c.prompt || "" })),
                            parts: data.parts || rawChapters.map(c => [c.text, c.prompt || ""]),
                            chapters: rawChapters.map(c => ({ image_url: c.image_url || c.image })),
                            cost_data: data.cost_data || null,
                            universe: data.universe || data.metadata?.inputs?.universe,
                            style: data.style || data.metadata?.inputs?.style,
                            character_names: data.character_names || data.metadata?.inputs?.names,
                            clothing_bible: data.clothing_bible || data.metadata?.clothing_bible,
                            character_appearance_bible: data.character_appearance_bible || data.metadata?.character_appearance_bible,
                            character_details: data.character_details || data.metadata?.character_details,
                            url_photos: data.url_photos || data.metadata?.url_photos,
                            metadata: data.metadata,
                            isShared: true
                        };
                        setSharedStory(adapted);
                        setView('RESULT');
                    } else {
                        alert("História não encontrada ou link expirado.");
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                } catch (err) {
                    console.error("Erro ao carregar história compartilhada:", err);
                    alert("Não foi possível carregar a história pelo link.");
                    window.history.replaceState({}, '', window.location.pathname);
                } finally {
                    setLoadingShared(false);
                }
            };
            fetchShared();
        }
    }, []);

    // Watch for generation completion
    useEffect(() => {
        if (generationState.result) {
            setView('RESULT');
        }
    }, [generationState.result]);

    // Go to HOME after successful login if we were in LOGIN view
    useEffect(() => {
        if (currentUser && view === 'LOGIN') {
            setView('HOME');
        }
    }, [currentUser, view]);

    const [characterOrigin, setCharacterOrigin] = useState('HOME');

    const handleCreateChar = (origin = 'HOME') => {
        setCharacterOrigin(origin);
        setView('CHARACTER');
    };

    // Updated: Selector is now the first step of story creation if characters exist
    const handleStartStory = () => setView('SELECTOR');

    const handleCharacterComplete = () => setView('SELECTOR'); // Go to selector after creating
    const handleCharacterStartStory = () => setView('WIZARD'); // Go directly to wizard when choosing to start

    const handleSelectorComplete = () => setView('WIZARD');

    const handleWizardComplete = () => {
        setView('LOADING');
        // startGeneration is called inside StoryWizard with data
    };

    const handleOpenLibrary = () => setView('LIBRARY');
    const handleOpenHeroes = () => setView('HEROES');
    const handleLogin = () => setView('LOGIN');
    const handleOpenShop = () => setView('SHOP');

    const handleCloseResult = () => {
        setSharedStory(null);
        if (window.location.search) {
            window.history.replaceState({}, '', window.location.pathname);
        }
        setView('HOME');
    };

    const currentView = () => {
        if (loadingShared) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
                    <div className="w-14 h-14 border-4 border-magic-pink border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h2 className="text-2xl font-serif font-bold text-amber-200">Abrindo Livro Mágico...</h2>
                    <p className="text-slate-400 mt-2 text-sm">Carregando história e ilustrações</p>
                </div>
            );
        }

        if (view === 'LOGIN') return <Login onBack={() => setView('HOME')} />;
        if (view === 'LOADING') return <LoadingAgent onCancel={() => { if (resetGeneration) resetGeneration(); setView('HOME'); }} />;
        if (view === 'RESULT') return <BookResult story={sharedStory} onClose={handleCloseResult} />;

        switch (view) {
            case 'HOME':
                return <Home
                    onCreateCharacter={() => handleCreateChar('HOME')}
                    onStartStory={handleStartStory}
                    onOpenLibrary={handleOpenLibrary}
                    onOpenHeroes={handleOpenHeroes}
                    onLogin={handleLogin}
                    onOpenShop={handleOpenShop}
                />;
            case 'CHARACTER':
                return <CharacterSetup
                    onNext={handleCharacterComplete}
                    onStartStory={handleCharacterStartStory}
                    onBack={() => setView(characterOrigin === 'SELECTOR' ? 'SELECTOR' : (characterOrigin === 'HEROES' ? 'HEROES' : 'HOME'))}
                />;
            case 'SELECTOR':
                return <CharacterSelector
                    onNext={handleSelectorComplete}
                    onBack={() => setView('HOME')}
                    onCreateNew={() => handleCreateChar('SELECTOR')}
                />;
            case 'HEROES':
                return <CharacterSelector
                    mode="gallery"
                    onNext={handleSelectorComplete}
                    onBack={() => setView('HOME')}
                    onCreateNew={() => handleCreateChar('HEROES')}
                />;
            case 'WIZARD':
                return <StoryWizard onNext={handleWizardComplete} onBack={() => setView('SELECTOR')} />;
            case 'LIBRARY':
                return <StoryLibrary onBack={() => setView('HOME')} />;
            case 'SHOP':
                return <Shop onBack={() => setView('HOME')} />;
            default:
                return <Home onCreateCharacter={() => handleCreateChar('HOME')} onStartStory={handleStartStory} onOpenShop={handleOpenShop} />;
        }
    };

    return (
        <div className="text-slate-700 min-h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full min-h-screen"
                >
                    {currentView()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function App() {
    return (
        <StoryProvider>
            <AppContent />
        </StoryProvider>
    );
}

export default App;
