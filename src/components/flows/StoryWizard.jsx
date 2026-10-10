import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Sparkles, Shuffle, Wand2, Users, Search, X, Check,
    BookOpen, Layers, Palette, Compass, SlidersHorizontal
} from 'lucide-react';
import {
    FaSpider, FaCube, FaFutbol, FaVolleyball, FaBasketball, FaFlagCheckered,
    FaBicycle, FaHeart, FaBiohazard, FaGem, FaMeteor, FaFlask, FaVanShuttle, FaHatCowboy
} from 'react-icons/fa6';
import { TbMickey, TbPokeball, TbWand } from 'react-icons/tb';
import {
    GiCastle, GiLightSabers, GiBatMask, GiQueenCrown, GiDonut, GiCyberEye, GiRing,
    GiPirateSkull, GiWesternHat, GiGears, GiNinjaStar, GiDragonBalls,
    GiShatteredSword, GiSuperMushroom, GiTriforce, GiWolfHead, GiTRexSkull, GiSpiderWeb,
    GiWinterHat, GiPortal, GiPineapple, GiPineTree, GiHedgehog, GiRocketFlight, GiToolbox, GiOgre
} from 'react-icons/gi';
import {
    Tv, Cpu, Eye, Wind, Flame, Gamepad2, Box, TestTubes, Leaf,
    BoxSelect, Shapes, Camera, Brush, PenTool, Hexagon, Sun, Terminal, Scissors, Castle, MessageSquare
} from 'lucide-react';

import { useStory } from '../../context/StoryContext';
import BackButton from '../ui/BackButton';

const UNIVERSES = [
    // --- FANTASIA & FICÇÃO (12) ---
    { id: 'fantasy_medieval', label: 'Medieval', icon: GiCastle, color: 'from-amber-700 to-orange-900', desc: 'Dragões & Reis', category: 'fantasy' },
    { id: 'star_wars', label: 'Star Wars', icon: GiLightSabers, color: 'from-blue-600 to-cyan-800', desc: 'Força & Sabres', category: 'fantasy' },
    { id: 'harry_potter', label: 'Harry Potter', icon: TbWand, color: 'from-purple-800 to-indigo-900', desc: 'Magia em Hogwarts', category: 'fantasy' },
    { id: 'marvel', label: 'Marvel', icon: FaSpider, color: 'from-red-600 to-red-900', desc: 'Super-heróis', category: 'fantasy' },
    { id: 'dc', label: 'DC Comics', icon: GiBatMask, color: 'from-slate-700 to-slate-900', desc: 'Lendas da Justiça', category: 'fantasy' },
    { id: 'disney_princess', label: 'Disney Princesas', icon: GiQueenCrown, color: 'from-pink-400 to-rose-600', desc: 'Contos de Fadas', category: 'fantasy' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: GiCyberEye, color: 'from-yellow-400 to-amber-600', desc: 'High Tech Low Life', category: 'fantasy' },
    { id: 'lord_rings', label: 'Senhor dos Anéis', icon: GiRing, color: 'from-green-700 to-emerald-900', desc: 'Terra Média', category: 'fantasy' },
    { id: 'pirates', label: 'Piratas', icon: GiPirateSkull, color: 'from-blue-900 to-slate-900', desc: '7 Mares', category: 'fantasy' },
    { id: 'western', label: 'Western', icon: GiWesternHat, color: 'from-orange-800 to-amber-900', desc: 'Bang Bang', category: 'fantasy' },
    { id: 'noir', label: 'Noir', icon: GiFedora, color: 'from-gray-800 to-black', desc: 'Mistério em P&B', category: 'fantasy' },
    { id: 'steampunk', label: 'Steampunk', icon: GiGears, color: 'from-amber-600 to-yellow-800', desc: 'Vapor & Engrenagens', category: 'fantasy' },

    // --- ANIMES (6) ---
    { id: 'pokemon', label: 'Pokémon', icon: TbPokeball, color: 'from-red-500 to-slate-700', desc: 'Temos que pegar!', category: 'anime' },
    { id: 'naruto', label: 'Naruto', icon: GiNinjaStar, color: 'from-orange-500 to-orange-700', desc: 'O Caminho Ninja', category: 'anime' },
    { id: 'dragon_ball', label: 'Dragon Ball', icon: GiDragonBalls, color: 'from-orange-600 to-yellow-400', desc: 'Nível Saiyajin', category: 'anime' },
    { id: 'one_piece', label: 'One Piece', icon: FaHatCowboy, color: 'from-red-600 to-blue-800', desc: 'Tesouros e Piratas', category: 'anime' },
    { id: 'titan', label: 'Attack on Titan', icon: GiShatteredSword, color: 'from-stone-700 to-red-900', desc: 'Muralhas e Titãs', category: 'anime' },
    { id: 'saint_seiya', label: 'Cavaleiros do Zodíaco', icon: FaMeteor, color: 'from-yellow-400 to-blue-900', desc: 'Pelo Cosmo!', category: 'anime' },

    // --- GAMES & ESPORTES (9) ---
    { id: 'mario', label: 'Super Mario', icon: GiSuperMushroom, color: 'from-red-500 to-blue-500', desc: 'Reino Cogumelo', category: 'games' },
    { id: 'zelda', label: 'Zelda', icon: GiTriforce, color: 'from-green-600 to-yellow-600', desc: 'Lenda de Hyrule', category: 'games' },
    { id: 'minecraft', label: 'Minecraft', icon: FaCube, color: 'from-green-500 to-stone-600', desc: 'Mundo de Blocos', category: 'games' },
    { id: 'arcane', label: 'Arcane (LoL)', icon: FaFlask, color: 'from-blue-600 to-purple-800', desc: 'Magia e Tecnologia', category: 'games' },
    { id: 'sonic', label: 'Sonic', icon: GiHedgehog, color: 'from-blue-600 to-blue-400', desc: 'Velocidade Máxima', category: 'games' },
    { id: 'football', label: 'Futebol', icon: FaFutbol, color: 'from-green-600 to-green-900', desc: 'Rumo ao Gol!', category: 'games' },
    { id: 'volleyball', label: 'Vôlei', icon: FaVolleyball, color: 'from-blue-400 to-yellow-500', desc: 'Corte e Vitória!', category: 'games' },
    { id: 'basketball', label: 'Basquete', icon: FaBasketball, color: 'from-orange-500 to-orange-700', desc: 'Enterrada Épica!', category: 'games' },
    { id: 'f1', label: 'Fórmula 1', icon: FaFlagCheckered, color: 'from-red-700 to-slate-900', desc: 'Velocidade e Pista', category: 'games' },

    // --- FILMES & SÉRIES (6) ---
    { id: 'stranger_things', label: 'Stranger Things', icon: FaBicycle, color: 'from-red-900 to-black', desc: 'Anos 80 e Mistério', category: 'movies' },
    { id: 'barbie', label: 'Barbie', icon: FaHeart, color: 'from-pink-400 to-rose-400', desc: 'Mundo Cor-de-Rosa', category: 'movies' },
    { id: 'got', label: 'Game of Thrones', icon: GiWolfHead, color: 'from-slate-400 to-slate-600', desc: 'Guerra de Tronos', category: 'movies' },
    { id: 'jurassic', label: 'Jurassic Park', icon: GiTRexSkull, color: 'from-green-800 to-amber-900', desc: 'Era dos Dinossauros', category: 'movies' },
    { id: 'spider_verse', label: 'Aranhaverso', icon: GiSpiderWeb, color: 'from-red-600 to-fuchsia-900', desc: 'Multiverso Aranha', category: 'movies' },
    { id: 'the_last_of_us', label: 'The Last of Us', icon: FaBiohazard, color: 'from-green-900 to-stone-800', desc: 'Sobrevivência', category: 'movies' },

    // --- ANIMAÇÕES (12) ---
    { id: 'simpsons', label: 'Os Simpsons', icon: GiDonut, color: 'from-yellow-400 to-yellow-600', desc: 'Comédia Amarela', category: 'animation' },
    { id: 'mickey', label: 'Mickey & Amigos', icon: TbMickey, color: 'from-red-600 to-yellow-500', desc: 'Magia Disney', category: 'animation' },
    { id: 'south_park', label: 'South Park', icon: GiWinterHat, color: 'from-cyan-400 to-orange-500', desc: 'Humor Ácido', category: 'animation' },
    { id: 'rick_morty', label: 'Rick & Morty', icon: GiPortal, color: 'from-green-500 to-blue-400', desc: 'Caos Interdimensional', category: 'animation' },
    { id: 'spongebob', label: 'Bob Esponja', icon: GiPineapple, color: 'from-yellow-400 to-blue-400', desc: 'Fenda do Biquíni', category: 'animation' },
    { id: 'scooby', label: 'Scooby-Doo', icon: FaVanShuttle, color: 'from-purple-700 to-green-500', desc: 'Mistérios e Fantasmas', category: 'animation' },
    { id: 'gravity_falls', label: 'Gravity Falls', icon: GiPineTree, color: 'from-green-800 to-amber-700', desc: 'Mistérios e Diários', category: 'animation' },
    { id: 'steven_universe', label: 'Steven Universe', icon: FaGem, color: 'from-pink-300 to-blue-400', desc: 'Gemas de Cristal', category: 'animation' },
    { id: 'phineas_ferb', label: 'Phineas & Ferb', icon: GiToolbox, color: 'from-orange-400 to-cyan-500', desc: 'Invenções de Verão', category: 'animation' },
    { id: 'toy_story', label: 'Toy Story', icon: GiRocketFlight, color: 'from-sky-500 to-amber-400', desc: 'Ao Infinito e Além', category: 'animation' },
    { id: 'shrek', label: 'Shrek', icon: GiOgre, color: 'from-lime-600 to-emerald-800', desc: 'Pântano & Contos', category: 'animation' },
    { id: 'avatar', label: 'Avatar: Aang', icon: Wind, color: 'from-cyan-500 to-amber-500', desc: 'Dobra dos Elementos', category: 'animation' },
];

// Helper to provide GiFedora fallback if missing
function GiFedora(props) {
    return <Compass {...props} />;
}

const UNIVERSE_CATEGORIES = [
    { id: 'all', label: 'Todos (45)' },
    { id: 'fantasy', label: 'Fantasia & Ficção' },
    { id: 'anime', label: 'Animes' },
    { id: 'games', label: 'Games & Esportes' },
    { id: 'movies', label: 'Filmes & Séries' },
    { id: 'animation', label: 'Animações' },
];

const STYLES = [
    // --- ESPECIAL ---
    { id: 'universe_default', label: 'Estilo do Universo', icon: Sparkles, color: 'from-[#9D7FEA] to-[#8364D8]', desc: 'Mantém a estética autêntica do universo escolhido.' },

    // --- ARTÍSTICOS E CONSAGRADOS ---
    { id: 'pixar', label: 'Pixar 3D', icon: BoxSelect, color: 'from-blue-400 to-cyan-500', desc: 'Animação 3D fofa e volumétrica.' },
    { id: 'ghibli', label: 'Studio Ghibli', icon: Leaf, color: 'from-emerald-400 to-teal-600', desc: 'Traços detalhados, poéticos e lúdicos.' },
    { id: 'watercolor', label: 'Aquarela Suave', icon: Palette, color: 'from-[#9D7FEA]/80 to-[#FBAE7B]', desc: 'Pintura fluida e artesanal de livro ilustrado.' },
    { id: 'disney_2d', label: 'Disney Clássico', icon: Castle, color: 'from-sky-400 to-blue-600', desc: 'Traço tradicional nostálgico feito à mão.' },
    { id: 'claymation', label: 'Massinha (Clay)', icon: Shapes, color: 'from-amber-400 to-orange-500', desc: 'Estilo stop-motion tátil e expressivo.' },
    { id: 'comic', label: 'Comic Book', icon: MessageSquare, color: 'from-amber-500 to-rose-500', desc: 'Estilo de HQ com hachuras e cores pop.' },
    { id: 'paper_cutout', label: 'Papel Recortado', icon: Scissors, color: 'from-orange-300 to-rose-400', desc: 'Camadas de papel artesanal recortado.' },
    { id: 'spiderverse_style', label: 'Aranhaverso', icon: Shapes, color: 'from-rose-500 to-purple-800', desc: '3D expressivo com texturas gráficas.' },
    { id: 'pixel_art', label: 'Pixel Art', icon: Gamepad2, color: 'from-emerald-400 to-cyan-500', desc: 'Estilo retrô e nostálgico dos games.' },
    { id: 'oil_painting', label: 'Pintura a Óleo', icon: Brush, color: 'from-amber-700 to-yellow-800', desc: 'Pinceladas visíveis em tela texturizada.' },
    { id: 'sketch_pencil', label: 'Esboço a Lápis', icon: PenTool, color: 'from-slate-500 to-slate-700', desc: 'Grafite manual com sombreado clássico.' },
    { id: 'low_poly', label: 'Low Poly 3D', icon: Hexagon, color: 'from-teal-400 to-blue-500', desc: 'Geometria limpa e moderna.' },
    { id: 'pop_art', label: 'Pop Art', icon: Sun, color: 'from-rose-400 to-amber-300', desc: 'Cores saturadas e grafismo vibrante.' },
    { id: 'minecraft_voxel', label: 'Voxel (Blocos)', icon: Box, color: 'from-green-600 to-stone-500', desc: 'Mundo construído com cubos 3D.' },
    { id: 'simpsons_style', label: 'Os Simpsons', icon: Tv, color: 'from-yellow-400 to-amber-500', desc: 'O clássico traço amarelo de cartoon.' },
    { id: 'naruto_style', label: 'Estilo Anime', icon: Wind, color: 'from-orange-500 to-rose-500', desc: 'Traço de animação japonesa dinâmico.' },
    { id: 'dragonball_style', label: 'Dragon Ball Z', icon: Flame, color: 'from-orange-600 to-amber-400', desc: 'Sombreamento forte e estilo shonen.' },
    { id: 'southpark_style', label: 'South Park', icon: Users, color: 'from-cyan-400 to-amber-500', desc: 'Colagem simples e cômica.' },
    { id: 'rickmorty_style', label: 'Rick & Morty', icon: TestTubes, color: 'from-green-400 to-cyan-500', desc: 'Cartoon sci-fi expressivo.' },
    { id: 'noir_cartoon', label: 'Cartoon Noir', icon: Eye, color: 'from-slate-700 to-slate-900', desc: 'Preto e branco com sombras marcantes.' },
    { id: 'realistic', label: 'Fotorealista', icon: Camera, color: 'from-slate-400 to-slate-600', desc: 'Texturas cinematográficas imersivas.' },
    { id: 'cyber_art', label: 'Neon Digital', icon: Cpu, color: 'from-purple-500 to-indigo-600', desc: 'Luzes neon e reflexos futuristas.' },
    { id: 'cyberpunk_glitch', label: 'Glitch Art', icon: Terminal, color: 'from-cyan-500 to-purple-600', desc: 'Estética digital contemporânea.' },
];

const GENRES = [
    { id: 'epic', label: 'Aventura Épica' },
    { id: 'comedy', label: 'Comédia' },
    { id: 'romance', label: 'Romance' },
    { id: 'mystery', label: 'Mistério' },
    { id: 'horror', label: 'Suspense Suave' },
    { id: 'scifi', label: 'Ficção Científica' },
    { id: 'fantasy', label: 'Fantasia Mágica' },
    { id: 'drama', label: 'História Emocionante' },
    { id: 'fable', label: 'Fábula com Moral' },
    { id: 'action', label: 'Muita Ação' },
    { id: 'pirate', label: 'Aventura Pirata' },
    { id: 'sports', label: 'Superação & Esporte' },
    { id: 'survival', label: 'Sobrevivência & Coragem' },
    { id: 'spy', label: 'Missão Secreta' },
    { id: 'superhero', label: 'Super-Heróis' },
    { id: 'cyberpunk', label: 'Futuro Tecnológico' },
    { id: 'western', label: 'Faroeste & Velho Oeste' },
    { id: 'thriller', label: 'Enigma Inesperado' },
];

const GENRE_PROMPTS = {
    epic: [
        "A busca por um artefato lendário que pode salvar o reino da escuridão.",
        "A jornada para acordar a última estrela cadente antes do sol raiar.",
        "A travessia de uma ponte dourada que só surge uma vez a cada cem anos.",
        "O encontro dos quatro guardiões para proteger o cristal da vida."
    ],
    comedy: [
        "Um dia inteiro onde todas as palavras pronunciadas viram balões coloridos.",
        "O herói acidentalmente ganha o poder de falar a língua secreta dos animais domésticos.",
        "Uma competição culinária mágica onde as sobremesas começam a fugir dos pratos.",
        "Um feitiço de invisibilidade que falha na hora mais engraçada da festa."
    ],
    romance: [
        "Duas almas que se comunicam através de canções levadas pelo vento marinho.",
        "Um encontro marcado sob a chuva de pétalas luminosas do grande carvalho.",
        "A viagem mágica para reconstruir o jardim das lembranças queridas."
    ],
    mystery: [
        "O enigma do relógio da torre que começou a girar para trás misteriosamente.",
        "O mapa que só revela o próximo passo sob a luz da lua cheia.",
        "O sumiço do livro de receitas do alquimista mais atrapalhado da vila."
    ],
    fantasy: [
        "A descoberta de uma porta secreta que dá para uma biblioteca dentro de uma árvore.",
        "O guardião do filhote de dragão que tem medo de espirrar fogo.",
        "O mercado flutuante nas nuvens onde se vendem sonhos engarrafados."
    ],
    scifi: [
        "A primeira expedição de uma nave feita de cristal até os anéis luminosos de Saturno.",
        "Um pequeno robô jardineiro que descobre a primeira flor em um planeta distante.",
        "A mensagem codificada vinda de uma civilização amiga escondida na nebulosa."
    ],
    fable: [
        "A árvore que só florescia quando alguém contava a ela uma história de bondade.",
        "O pequeno riacho que sonhava em ver o mar e foi ajudado pelos animais da floresta.",
        "A coruja que aprendeu que ouvir com o coração vale mais do que falar bonito."
    ],
    action: [
        "Uma corrida eletrizante de naves voadoras através dos cânions de cristal.",
        "A defesa do farol encantado durante a tempestade dos ventos gigantes.",
        "O resgate audacioso nas profundezas do labirinto das engrenagens perdidas."
    ],
    sports: [
        "O time de amigos que se une para vencer o grande torneio com trabalho em equipe.",
        "A corrida mais veloz do reino onde a persistência vale mais que a velocidade.",
        "O dia em que a pequena atleta descobriu a magia do passe perfeito."
    ]
};

const DEFAULT_PROMPTS = [
    "Uma jornada inesquecível para encontrar o vale onde as estrelas descansam.",
    "Dois amigos que encontram uma chave antiga e descobrem um mundo secreto.",
    "Um desafio divertido que ensina que a amizade é a maior força de todas.",
    "Uma aventura cheia de descobertas através de cenários mágicos e inesperados."
];

export default function StoryWizard({ onNext, onBack }) {
    const { startGeneration, selectedCharacters } = useStory();

    const [data, setData] = useState({
        universe: null,
        style: 'universe_default',
        genre: null,
        description: ''
    });

    const [isUniverseModalOpen, setIsUniverseModalOpen] = useState(false);
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [modalCategory, setModalCategory] = useState('all');
    const [showCharacterModal, setShowCharacterModal] = useState(false);

    // Customização opcional dos personagens
    const [characterDetails, setCharacterDetails] = useState(
        selectedCharacters.map(char => ({
            id: char.id,
            role: '',
            nickname: '',
            personality: ''
        }))
    );

    const handleSelect = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleCharacterDetailChange = (charId, field, value) => {
        setCharacterDetails(prev => prev.map(detail =>
            detail.id === charId ? { ...detail, [field]: value } : detail
        ));
    };

    const handleRandomPrompt = () => {
        const pool = data.genre && GENRE_PROMPTS[data.genre] ? GENRE_PROMPTS[data.genre] : DEFAULT_PROMPTS;
        const random = pool[Math.floor(Math.random() * pool.length)];
        setData(prev => ({ ...prev, description: random }));
    };

    const currentUniverse = useMemo(() => {
        return UNIVERSES.find(u => u.id === data.universe) || null;
    }, [data.universe]);

    const currentGenre = useMemo(() => {
        return GENRES.find(g => g.id === data.genre) || null;
    }, [data.genre]);

    const currentStyle = useMemo(() => {
        return STYLES.find(s => s.id === data.style) || STYLES[0];
    }, [data.style]);

    // Filtragem no catálogo modal
    const filteredModalUniverses = useMemo(() => {
        return UNIVERSES.filter(u => {
            const matchesCategory = modalCategory === 'all' || u.category === modalCategory;
            const term = modalSearchTerm.trim().toLowerCase();
            const matchesSearch = !term || u.label.toLowerCase().includes(term) || u.desc.toLowerCase().includes(term);
            return matchesCategory && matchesSearch;
        });
    }, [modalCategory, modalSearchTerm]);

    const handleCreateStory = () => {
        if (!data.universe || !data.genre) return;

        const charactersWithDetails = selectedCharacters.map(char => {
            const details = characterDetails.find(d => d.id === char.id) || {};
            return {
                ...char,
                customRole: details.role,
                customNickname: details.nickname,
                customPersonality: details.personality
            };
        });

        startGeneration({
            universe: data.universe,
            style: data.style || 'universe_default',
            genre: data.genre,
            description: data.description || '',
            characters: charactersWithDetails
        });
        onNext();
    };

    const isReady = !!data.universe && !!data.genre;

    return (
        <div className="min-h-screen flex flex-col items-center pt-6 px-4 pb-32 relative font-body text-slate-800 bg-[#FAF8F5]">
            <BackButton onClick={onBack} />

            <main className="w-full max-w-6xl z-10 flex flex-col gap-6 mt-14 sm:mt-6">
                {/* Header Minimalista & Equilibrado */}
                <div className="text-center space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE5DC] text-xs font-bold text-[#8364D8] shadow-xs">
                        <Sparkles size={14} className="text-[#9D7FEA]" />
                        <span>Estúdio de Criação • Maginária</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-slate-800 tracking-tight">
                        Monte o Seu <span className="text-[#8364D8]">Livro Mágico</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                        Defina o mundo, a arte e a trama da aventura com tudo em uma tela só e sem distrações.
                    </p>
                </div>

                {/* GRID 50/50 SIMÉTRICO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    
                    {/* COLUNA ESQUERDA: O MUNDO & A ARTE */}
                    <div className="flex flex-col gap-6">
                        
                        {/* 1. SELETOR DE UNIVERSO (Card Principal) */}
                        <div className="tactile-card bg-white p-5 sm:p-6 flex flex-col justify-between min-h-[190px]">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-[#9D7FEA]/15 text-[#8364D8] font-bold text-xs flex items-center justify-center">
                                            1
                                        </div>
                                        <div>
                                            <h2 className="font-heading font-bold text-slate-800 text-base leading-tight">
                                                Universo da História
                                            </h2>
                                            <p className="text-[11px] text-slate-400">Onde a aventura vai acontecer</p>
                                        </div>
                                    </div>

                                    {currentUniverse ? (
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#9D7FEA]/10 text-[#8364D8] border border-[#9D7FEA]/30">
                                            Escolhido
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                                            Obrigatório
                                        </span>
                                    )}
                                </div>

                                {/* Preview do Universo Selecionado ou Estado Vazio */}
                                {currentUniverse ? (
                                    <div
                                        onClick={() => setIsUniverseModalOpen(true)}
                                        className="cursor-pointer p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#9D7FEA] transition-all flex items-center justify-between group mt-2"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentUniverse.color} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                                <currentUniverse.icon size={24} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#8364D8] transition-colors">
                                                    {currentUniverse.label}
                                                </h3>
                                                <p className="text-xs text-slate-400 truncate">{currentUniverse.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-[#8364D8] bg-white border border-[#EAE5DC] px-3 py-1.5 rounded-xl shrink-0 group-hover:border-[#9D7FEA]">
                                            <span>Trocar</span>
                                            <ChevronRight size={13} />
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsUniverseModalOpen(true)}
                                        className="cursor-pointer p-4 rounded-2xl bg-[#FAF8F5] border-2 border-dashed border-[#EAE5DC] hover:border-[#9D7FEA] hover:bg-[#FAF8F5]/80 transition-all flex items-center justify-between group mt-2"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 rounded-xl bg-white border border-[#EAE5DC] text-[#8364D8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Compass size={22} className="text-[#9D7FEA]" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-700 text-sm">
                                                    Nenhum universo selecionado
                                                </h3>
                                                <p className="text-xs text-slate-400">Toque para explorar 45 universos disponíveis</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="px-3.5 py-1.5 rounded-xl bg-[#9D7FEA] text-white text-xs font-bold shrink-0 hover:bg-[#8F6EE5] transition-all shadow-xs"
                                        >
                                            Explorar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 pt-3 border-t border-[#EAE5DC]/60 flex items-center justify-between text-[11px] text-slate-400">
                                <span>45 cenários catalogados</span>
                                <button
                                    type="button"
                                    onClick={() => setIsUniverseModalOpen(true)}
                                    className="text-xs font-bold text-[#8364D8] hover:underline cursor-pointer"
                                >
                                    Ver todos os 45 mundos →
                                </button>
                            </div>
                        </div>

                        {/* 2. ESTILO VISUAL DAS ILUSTRAÇÕES (Card Simétrico) */}
                        <div className="tactile-card bg-white p-5 sm:p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-[#9D7FEA]/15 text-[#8364D8] font-bold text-xs flex items-center justify-center">
                                            2
                                        </div>
                                        <div>
                                            <h2 className="font-heading font-bold text-slate-800 text-base leading-tight">
                                                Estilo Visual da Arte
                                            </h2>
                                            <p className="text-[11px] text-slate-400">O traço estético das ilustrações</p>
                                        </div>
                                    </div>

                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-slate-600 border border-[#EAE5DC]">
                                        {currentStyle.label}
                                    </span>
                                </div>

                                {/* Grade Simétrica de Estilos Visuais */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1 pr-1.5 [scrollbar-width:thin]">
                                    {STYLES.map((s) => {
                                        const isSelected = data.style === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => handleSelect('style', s.id)}
                                                className={`p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#9D7FEA]/10 border-2 border-[#9D7FEA] shadow-xs'
                                                        : 'bg-[#FAF8F5] hover:bg-[#F3EFE9] border-[#EAE5DC] text-slate-700'
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0 shadow-xs ${isSelected ? 'scale-105' : ''}`}>
                                                    <s.icon size={18} />
                                                </div>
                                                <div className="w-full">
                                                    <span className={`font-bold text-xs block truncate ${isSelected ? 'text-[#8364D8]' : 'text-slate-700'}`}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-[#EAE5DC]/60">
                                💡 Dica: "Estilo do Universo" mantém a fidelidade exata da animação ou filme original.
                            </p>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: A TRAMA & HERÓIS */}
                    <div className="flex flex-col gap-6">
                        
                        {/* 3. SELETOR DE GÊNERO / TEMA */}
                        <div className="tactile-card bg-white p-5 sm:p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-[#FBAE7B]/25 text-[#D97736] font-bold text-xs flex items-center justify-center">
                                            3
                                        </div>
                                        <div>
                                            <h2 className="font-heading font-bold text-slate-800 text-base leading-tight">
                                                Gênero & Tema
                                            </h2>
                                            <p className="text-[11px] text-slate-400">Qual será a pegada da narrativa?</p>
                                        </div>
                                    </div>

                                    {currentGenre ? (
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#9D7FEA] text-white">
                                            {currentGenre.label}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                                            Obrigatório
                                        </span>
                                    )}
                                </div>

                                {/* Chips Táteis de Gênero */}
                                <div className="flex flex-wrap gap-2 max-h-[190px] overflow-y-auto p-0.5 [scrollbar-width:thin]">
                                    {GENRES.map((g) => {
                                        const isSelected = data.genre === g.id;
                                        return (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => handleSelect('genre', g.id)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#9D7FEA] text-white border-[#8364D8] shadow-xs'
                                                        : 'bg-[#FAF8F5] hover:bg-[#F3EFE9] border-[#EAE5DC] text-slate-600 hover:text-slate-800'
                                                }`}
                                            >
                                                {g.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-[#EAE5DC]/60">
                                18 gêneros infantis e juvenis prontos para inspirar a história.
                            </p>
                        </div>

                        {/* 4. IDEIA DA HISTÓRIA & HERÓIS */}
                        <div className="tactile-card bg-white p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-[#FBAE7B]/25 text-[#D97736] font-bold text-xs flex items-center justify-center">
                                            4
                                        </div>
                                        <div>
                                            <h2 className="font-heading font-bold text-slate-800 text-base leading-tight">
                                                Ideia da História
                                            </h2>
                                            <p className="text-[11px] text-slate-400">Opcional: um gancho ou detalhe especial</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleRandomPrompt}
                                        className="px-3 py-1.5 rounded-xl bg-[#FBAE7B]/15 hover:bg-[#FBAE7B]/25 text-[#D97736] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                        title="Sortear ideia para o tema selecionado"
                                    >
                                        <Shuffle size={13} />
                                        <span>Sortear Ideia</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => handleSelect('description', e.target.value)}
                                        placeholder={
                                            data.genre
                                                ? `Escreva um detalhe para esta aventura de ${currentGenre?.label || 'história'} ou clique em 'Sortear Ideia'...`
                                                : "Selecione um tema acima ou clique em 'Sortear Ideia' para inspirações..."
                                        }
                                        className="w-full h-24 bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-3.5 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#9D7FEA] focus:ring-1 focus:ring-[#9D7FEA]/30 resize-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Strip de Heróis Participantes */}
                            {selectedCharacters.length > 0 && (
                                <div className="pt-3 border-t border-[#EAE5DC]/60 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="flex -space-x-2 overflow-hidden shrink-0">
                                            {selectedCharacters.map(char => (
                                                <img
                                                    key={char.id}
                                                    src={char.avatar || (char.photos && char.photos[0]) || "https://placehold.co/100x120/e2e8f0/cbd5e1"}
                                                    alt={char.nickname}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                                                />
                                            ))}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-700 truncate">
                                                {selectedCharacters.map(c => c.nickname).join(', ')}
                                            </p>
                                            <p className="text-[10px] text-slate-400">Heróis na história</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowCharacterModal(true)}
                                        className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-slate-700 hover:border-[#9D7FEA] hover:text-[#8364D8] font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                                    >
                                        <Users size={14} />
                                        <span>Personalizar</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BARRA FIXA DE SUMÁRIO & CRIAÇÃO */}
                <div className="bg-white rounded-3xl border border-[#EAE5DC] p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-2xl ${currentUniverse ? `bg-gradient-to-br ${currentUniverse.color} text-white` : 'bg-[#FAF8F5] text-slate-400 border border-[#EAE5DC]'} flex items-center justify-center shrink-0 shadow-xs`}>
                            {currentUniverse ? <currentUniverse.icon size={24} /> : <BookOpen size={24} className="text-[#9D7FEA]" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm sm:text-base ${currentUniverse ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {currentUniverse ? currentUniverse.label : '1. Escolha o Universo'}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className={`font-bold text-xs sm:text-sm ${currentGenre ? 'text-[#8364D8]' : 'text-slate-400'}`}>
                                    {currentGenre ? currentGenre.label : '2. Escolha o Gênero'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Estilo: <span className="font-semibold text-slate-600">{currentStyle.label}</span>
                                {selectedCharacters.length > 0 && ` • ${selectedCharacters.length} herói(s)`}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateStory}
                        disabled={!isReady}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base transition-all ${
                            isReady
                                ? 'bg-[#9D7FEA] hover:bg-[#8F6EE5] text-white border-b-4 border-[#8364D8] active:border-b-0 active:translate-y-1 shadow-md shadow-[#9D7FEA]/20 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 border-b-4 border-slate-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <span>Criar Livro Mágico ✨</span>
                        <Wand2 size={18} />
                    </button>
                </div>
            </main>

            {/* MODAL DE CATÁLOGO DOS 45 UNIVERSOS */}
            <AnimatePresence>
                {isUniverseModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUniverseModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EAE5DC]"
                        >
                            {/* Modal Header */}
                            <div className="p-5 sm:p-6 border-b border-[#EAE5DC] bg-[#FAF8F5] flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#9D7FEA]/15 text-[#8364D8] flex items-center justify-center font-bold">
                                            <Compass size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-slate-800 text-lg sm:text-xl">
                                                Catálogo de 45 Universos
                                            </h3>
                                            <p className="text-xs text-slate-400">Escolha o mundo mágico onde sua história vai se passar</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsUniverseModalOpen(false)}
                                        className="w-9 h-9 rounded-full bg-white border border-[#EAE5DC] text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Busca & Categorias */}
                                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                                    {/* Categorias (Abas) */}
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none]">
                                        {UNIVERSE_CATEGORIES.map(cat => {
                                            const isActive = modalCategory === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setModalCategory(cat.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                                                        isActive
                                                            ? 'bg-[#9D7FEA] text-white border-[#8364D8] shadow-xs'
                                                            : 'bg-white hover:bg-slate-100 border-[#EAE5DC] text-slate-600'
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Busca */}
                                    <div className="relative min-w-[200px] sm:w-64">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={modalSearchTerm}
                                            onChange={(e) => setModalSearchTerm(e.target.value)}
                                            placeholder="Buscar universo..."
                                            className="w-full bg-white border border-[#EAE5DC] rounded-xl pl-9 pr-7 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#9D7FEA] transition-all"
                                        />
                                        {modalSearchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => setModalSearchTerm('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Grid of Universes */}
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 [scrollbar-width:thin]">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {filteredModalUniverses.map(u => {
                                        const isSelected = data.universe === u.id;
                                        return (
                                            <div
                                                key={u.id}
                                                onClick={() => {
                                                    handleSelect('universe', u.id);
                                                    setIsUniverseModalOpen(false);
                                                }}
                                                className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all border cursor-pointer select-none ${
                                                    isSelected
                                                        ? 'bg-[#9D7FEA]/10 border-2 border-[#9D7FEA] shadow-xs'
                                                        : 'bg-[#FAF8F5] hover:bg-[#F3EFE9] border-[#EAE5DC]'
                                                }`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${u.color} text-white flex items-center justify-center shrink-0 shadow-xs ${isSelected ? 'scale-105' : ''}`}>
                                                    <u.icon size={22} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-[#8364D8]' : 'text-slate-800'}`}>
                                                        {u.label}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400 truncate">{u.desc}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-[#9D7FEA] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {filteredModalUniverses.length === 0 && (
                                    <div className="text-center py-16 text-slate-400 text-xs">
                                        Nenhum universo encontrado para "{modalSearchTerm}".
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-[#EAE5DC] bg-[#FAF8F5] flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    {filteredModalUniverses.length} universo(s) exibido(s)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsUniverseModalOpen(false)}
                                    className="px-5 py-2 rounded-xl bg-white border border-[#EAE5DC] hover:border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE PERSONALIZAÇÃO DOS HERÓIS */}
            <AnimatePresence>
                {showCharacterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCharacterModal(false)}
                            className="absolute inset-0 bg-slate-900/40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EAE5DC]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#EAE5DC] bg-[#FAF8F5]">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-800">
                                        Personalizar <span className="text-[#8364D8]">Heróis da História</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Preencha papéis ou traços para enriquecer a narrativa (opcional).</p>
                                </div>
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                                {selectedCharacters.map((char) => {
                                    const details = characterDetails.find(d => d.id === char.id) || {};
                                    return (
                                        <div key={char.id} className="p-4 sm:p-5 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] flex flex-col sm:flex-row gap-5">
                                            <div className="flex flex-col items-center gap-2 w-full sm:w-[130px] shrink-0">
                                                <div className="w-20 sm:w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xs">
                                                    <img
                                                        src={char.avatar || (char.photos && char.photos[0]) || "https://placehold.co/100x120/e2e8f0/cbd5e1"}
                                                        alt={char.nickname}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="font-bold text-xs text-slate-700 text-center">{char.nickname}</span>
                                            </div>

                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="space-y-1 bg-white p-3 rounded-xl border border-[#EAE5DC]">
                                                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Apelido na História</label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Ex: Capitão ${char.nickname}`}
                                                        value={details.nickname}
                                                        onChange={(e) => handleCharacterDetailChange(char.id, 'nickname', e.target.value)}
                                                        className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1 bg-white p-3 rounded-xl border border-[#EAE5DC]">
                                                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Papel (Herói, Mago...)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Mago Protetor"
                                                        value={details.role}
                                                        onChange={(e) => handleCharacterDetailChange(char.id, 'role', e.target.value)}
                                                        className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1 bg-white p-3 rounded-xl border border-[#EAE5DC] sm:col-span-2">
                                                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Personalidade</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Corajoso, leal e sempre pronto para ajudar os amigos"
                                                        value={details.personality}
                                                        onChange={(e) => handleCharacterDetailChange(char.id, 'personality', e.target.value)}
                                                        className="w-full bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-[#EAE5DC] bg-[#FAF8F5] flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 text-xs cursor-pointer"
                                >
                                    Sair
                                </button>
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="px-6 py-2.5 rounded-xl bg-[#9D7FEA] text-white font-bold hover:bg-[#8F6EE5] text-xs cursor-pointer shadow-xs"
                                >
                                    Salvar e Continuar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
