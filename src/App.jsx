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


function AppContent() {
    const { currentUser } = useAuth();
    const { startGeneration, generationState } = useStory();
    const [view, setView] = useState('HOME');

    // Scroll to top on view change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

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

    const handleCreateChar = () => setView('CHARACTER');

    // Updated: Selector is now the first step of story creation if characters exist
    const handleStartStory = () => setView('SELECTOR');

    const handleCharacterComplete = () => setView('HOME'); // Return to home after creating

    const handleSelectorComplete = () => setView('WIZARD');

    const handleWizardComplete = () => {
        setView('LOADING');
        // startGeneration is called inside StoryWizard with data
    };

    const handleOpenLibrary = () => setView('LIBRARY');
    const handleOpenHeroes = () => setView('HEROES');
    const handleLogin = () => setView('LOGIN');
    const handleOpenShop = () => setView('SHOP');

    const currentView = () => {
        if (view === 'LOGIN') return <Login onBack={() => setView('HOME')} />;
        if (view === 'LOADING') return <LoadingAgent />; // Loading has no back
        if (view === 'RESULT') return <BookResult onClose={() => setView('HOME')} />;

        switch (view) {
            case 'HOME':
                return <Home
                    onCreateCharacter={handleCreateChar}
                    onStartStory={handleStartStory}
                    onOpenLibrary={handleOpenLibrary}
                    onOpenHeroes={handleOpenHeroes}
                    onLogin={handleLogin}
                    onOpenShop={handleOpenShop}
                />;
            case 'CHARACTER':
                // Temporarily using CharacterSetup if it exists, or will update it next
                return <CharacterSetup onNext={handleCharacterComplete} onBack={() => setView('HOME')} />;
            case 'SELECTOR':
                return <CharacterSelector onNext={handleSelectorComplete} onBack={() => setView('HOME')} onCreateNew={handleCreateChar} />;
            case 'HEROES':
                return <CharacterSelector
                    mode="gallery"
                    onNext={() => { }} // No action on selection in gallery mode
                    onBack={() => setView('HOME')}
                    onCreateNew={handleCreateChar}
                />;
            case 'WIZARD':
                return <StoryWizard onNext={handleWizardComplete} onBack={() => setView('SELECTOR')} />;
            case 'LIBRARY':
                return <StoryLibrary onBack={() => setView('HOME')} />;
            case 'SHOP':
                return <Shop onBack={() => setView('HOME')} />;
            default:
                return <Home onCreateCharacter={handleCreateChar} onStartStory={handleStartStory} onOpenShop={handleOpenShop} />;
        }
    };

    return (
        <div className="text-gray-100 min-h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4 }}
                    className="w-full min-h-screen"
                >
                    {currentView()}
                </motion.div>
            </AnimatePresence>
        </div >
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
