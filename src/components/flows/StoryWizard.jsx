import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Check, Wand2, Shuffle, Sparkles, Tv, Cpu, Gem, Skull, Compass, Eye, Cog, Wind, Flame, Anchor, Axe, Star, Gamepad2, Sword, Box, FlaskConical, FastForward, CircleDot, Volleyball, CircleDashed, Flag, Bike, Heart, Snowflake, Bone, Bug, Biohazard, Smile, Users, TestTubes, Waves, Search, TreePine, Wrench, Leaf, BoxSelect, Shapes, Palette, MessageSquare, Camera, Brush, PenTool, Hexagon, Sun, Terminal, Scissors, Castle, X } from 'lucide-react';
import {
    FaSpider, FaUserSecret, FaCube, FaFutbol, FaVolleyball, FaBasketball, FaFlagCheckered,
    FaBicycle, FaHeart, FaBiohazard, FaComputerMouse, FaMagnifyingGlass, FaWrench, FaGem, FaMeteor, FaFlask, FaVanShuttle, FaHatCowboy
} from 'react-icons/fa6';

import { TbBrandDisney, TbMickey, TbPokeball, TbWand } from 'react-icons/tb';
import { MdCatchingPokemon } from 'react-icons/md';

import {
    GiCastle, GiLightSabers, GiFairyWand, GiBatMask, GiQueenCrown, GiDonut, GiCyberEye, GiRing,
    GiCatch, GiPirateSkull, GiWesternHat, GiGears, GiNinjaStar, GiDragonBalls, GiPirateHat,
    GiShatteredSword, GiSuperMushroom, GiTriforce, GiWolfHead, GiTRexSkull, GiSpiderWeb,
    GiWinterHat, GiPortal, GiPineapple, GiPineTree,
    GiSittingDog, GiFedora, GiHedgehog, GiRocketFlight, GiPirateFlag, GiToolbox, GiOgre
} from 'react-icons/gi';

import { useStory } from '../../context/StoryContext';
import BackButton from '../ui/BackButton';
const UNIVERSES = [
    // --- CLÁSSICOS & FANTASIA (14) ---
    { id: 'fantasy_medieval', label: 'Medieval', icon: GiCastle, color: 'from-amber-700 to-orange-900', desc: 'Dragões & Reis' },
    { id: 'star_wars', label: 'Star Wars', icon: GiLightSabers, color: 'from-blue-600 to-cyan-800', desc: 'Força & Sabres' },
    { id: 'harry_potter', label: 'Harry Potter', icon: TbWand, color: 'from-purple-800 to-indigo-900', desc: 'Magia em Hogwarts' },
    { id: 'marvel', label: 'Marvel', icon: FaSpider, color: 'from-red-600 to-red-900', desc: 'Super-heróis' },
    { id: 'dc', label: 'DC Comics', icon: GiBatMask, color: 'from-slate-700 to-slate-900', desc: 'Lendas da Justiça' },
    { id: 'disney_princess', label: 'Disney Princesas', icon: GiQueenCrown, color: 'from-pink-400 to-rose-600', desc: 'Contos de Fadas' },
    { id: 'simpsons', label: 'Os Simpsons', icon: GiDonut, color: 'from-yellow-400 to-yellow-600', desc: 'Comédia Amarela' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: GiCyberEye, color: 'from-yellow-300 to-yellow-500', desc: 'High Tech Low Life' },
    { id: 'lord_rings', label: 'Senhor dos Anéis', icon: GiRing, color: 'from-green-700 to-emerald-900', desc: 'Terra Média' },
    { id: 'pokemon', label: 'Pokémon', icon: TbPokeball, color: 'from-red-500 to-white', desc: 'Temos que pegar!' },
    { id: 'pirates', label: 'Piratas', icon: GiPirateSkull, color: 'from-blue-900 to-slate-900', desc: '7 Mares' },
    { id: 'western', label: 'Western', icon: GiWesternHat, color: 'from-orange-800 to-amber-900', desc: 'Bang Bang' },
    { id: 'noir', label: 'Noir', icon: GiFedora, color: 'from-gray-800 to-black', desc: 'Mistério em P&B' },
    { id: 'steampunk', label: 'Steampunk', icon: GiGears, color: 'from-amber-600 to-yellow-800', desc: 'Vapor & Engrenagens' },

    // --- ANIMES (5) ---
    { id: 'naruto', label: 'Naruto', icon: GiNinjaStar, color: 'from-orange-500 to-orange-700', desc: 'O Caminho Ninja' },
    { id: 'dragon_ball', label: 'Dragon Ball', icon: GiDragonBalls, color: 'from-orange-600 to-yellow-400', desc: 'Nível Saiyajin' },
    { id: 'one_piece', label: 'One Piece', icon: FaHatCowboy, color: 'from-red-600 to-blue-800', desc: 'Tesouros e Piratas' },
    { id: 'titan', label: 'Attack on Titan', icon: GiShatteredSword, color: 'from-stone-700 to-red-900', desc: 'Muralhas e Titãs' },
    { id: 'saint_seiya', label: 'Cavaleiros do Zodíaco', icon: FaMeteor, color: 'from-yellow-400 to-blue-900', desc: 'Pelo Cosmo!' },

    // --- GAMES (5) ---
    { id: 'mario', label: 'Super Mario', icon: GiSuperMushroom, color: 'from-red-500 to-blue-500', desc: 'Reino Cogumelo' },
    { id: 'zelda', label: 'Zelda', icon: GiTriforce, color: 'from-green-600 to-yellow-600', desc: 'Lenda de Hyrule' },
    { id: 'minecraft', label: 'Minecraft', icon: FaCube, color: 'from-green-500 to-stone-600', desc: 'Mundo de Blocos' },
    { id: 'arcane', label: 'Arcane (LoL)', icon: FaFlask, color: 'from-blue-600 to-purple-800', desc: 'Magia e Tecnologia' },
    { id: 'sonic', label: 'Sonic', icon: GiHedgehog, color: 'from-blue-600 to-blue-400', desc: 'Velocidade Máxima' },

    // --- ESPORTES (4) ---
    { id: 'football', label: 'Futebol', icon: FaFutbol, color: 'from-green-600 to-green-900', desc: 'Rumo ao Gol!' },
    { id: 'volleyball', label: 'Vôlei', icon: FaVolleyball, color: 'from-blue-400 to-yellow-500', desc: 'Corte e Vitória!' },
    { id: 'basketball', label: 'Basquete', icon: FaBasketball, color: 'from-orange-500 to-orange-700', desc: 'Enterrada Épica!' },
    { id: 'f1', label: 'Fórmula 1', icon: FaFlagCheckered, color: 'from-red-700 to-slate-900', desc: 'Velocidade e Pista' },

    // --- FILMES & SÉRIES (6) ---
    { id: 'stranger_things', label: 'Stranger Things', icon: FaBicycle, color: 'from-red-900 to-black', desc: 'Anos 80 e Mistério' },
    { id: 'barbie', label: 'Barbie', icon: FaHeart, color: 'from-pink-400 to-rose-300', desc: 'Mundo Cor-de-Rosa' },
    { id: 'got', label: 'Game of Thrones', icon: GiWolfHead, color: 'from-slate-400 to-slate-600', desc: 'Guerra de Tronos' },
    { id: 'jurassic', label: 'Jurassic Park', icon: GiTRexSkull, color: 'from-green-800 to-amber-900', desc: 'Era dos Dinossauros' },
    { id: 'spider_verse', label: 'Aranhaverso', icon: GiSpiderWeb, color: 'from-red-600 to-fuchsia-900', desc: 'Multiverso Aranha' },
    { id: 'the_last_of_us', label: 'The Last of Us', icon: FaBiohazard, color: 'from-green-900 to-stone-800', desc: 'Sobrevivência' },

    // --- ANIMAÇÕES (11) ---
    { id: 'mickey', label: 'Mickey & Amigos', icon: TbMickey, color: 'from-red-600 to-yellow-500', desc: 'Magia Disney' },
    { id: 'south_park', label: 'South Park', icon: GiWinterHat, color: 'from-cyan-400 to-orange-500', desc: 'Humor Ácido' },
    { id: 'rick_morty', label: 'Rick & Morty', icon: GiPortal, color: 'from-green-500 to-blue-400', desc: 'Caos Interdimensional' },
    { id: 'spongebob', label: 'Bob Esponja', icon: GiPineapple, color: 'from-yellow-400 to-blue-400', desc: 'Fenda do Biquíni' },
    { id: 'scooby', label: 'Scooby-Doo', icon: FaVanShuttle, color: 'from-purple-700 to-green-500', desc: 'Mistérios e Fantasmas' },
    { id: 'gravity_falls', label: 'Gravity Falls', icon: GiPineTree, color: 'from-green-800 to-amber-700', desc: 'Mistérios e Diários' },
    { id: 'steven_universe', label: 'Steven Universe', icon: FaGem, color: 'from-pink-300 to-blue-400', desc: 'Gemas de Cristal' },
    { id: 'phineas_ferb', label: 'Phineas & Ferb', icon: GiToolbox, color: 'from-orange-400 to-cyan-500', desc: 'Invenções de Verão' },
    { id: 'toy_story', label: 'Toy Story', icon: GiRocketFlight, color: 'from-sky-500 to-amber-400', desc: 'Ao Infinito e Além' },
    { id: 'shrek', label: 'Shrek', icon: GiOgre, color: 'from-lime-600 to-emerald-800', desc: 'Pântano & Contos' },
    { id: 'avatar', label: 'Avatar: Aang', icon: Wind, color: 'from-cyan-500 to-amber-500', desc: 'Dobra dos Elementos' },
];

const STYLES = [
    // --- ESPECIAL ---
    { id: 'universe_default', label: 'Estilo do Universo', icon: Sparkles, color: 'from-indigo-500 to-purple-600', desc: 'Mantém a estética original do universo escolhido.' },

    // --- FAMOSOS (MARCAS/ANIME) ---
    { id: 'ghibli', label: 'Studio Ghibli', icon: Leaf, color: 'from-emerald-400 to-teal-600', desc: 'Traços detalhados, lúdicos e cores vibrantes.' },
    { id: 'simpsons_style', label: 'Os Simpsons', icon: Tv, color: 'from-yellow-400 to-yellow-600', desc: 'O clássico traço amarelo de Matt Groening.' },
    { id: 'naruto_style', label: 'Estilo Naruto', icon: Wind, color: 'from-orange-500 to-orange-700', desc: 'Traço de anime shonen dinâmico e focado em ação.' },
    { id: 'dragonball_style', label: 'Dragon Ball Z', icon: Flame, color: 'from-orange-600 to-yellow-400', desc: 'Estilo icônico de Akira Toriyama com sombras fortes.' },
    { id: 'southpark_style', label: 'South Park', icon: Users, color: 'from-cyan-400 to-orange-500', desc: 'Estilo de recorte de papel simples e cômico.' },
    { id: 'rickmorty_style', label: 'Rick & Morty', icon: TestTubes, color: 'from-green-400 to-sky-400', desc: 'Traço de cartoon sci-fi caótico e expressivo.' },
    { id: 'spiderverse_style', label: 'Aranhaverso', icon: Bug, color: 'from-red-600 to-fuchsia-900', desc: 'Mistura de 3D com texturas de quadrinhos e grafite.' },

    // --- GENÉRICOS / ARTÍSTICOS ---
    { id: 'pixar', label: 'Pixar 3D', icon: BoxSelect, color: 'from-blue-400 to-cyan-500', desc: 'Animação 3D moderna, fofa e volumétrica.' },
    { id: 'disney_2d', label: 'Disney Clássico', icon: Castle, color: 'from-sky-300 to-blue-500', desc: 'Traço tradicional feito à mão dos anos 90.' },
    { id: 'claymation', label: 'Massinha (Clay)', icon: Shapes, color: 'from-orange-400 to-amber-600', desc: 'Estilo stop-motion tátil e artesanal.' },
    { id: 'watercolor', label: 'Aquarela', icon: Palette, color: 'from-indigo-300 to-purple-400', desc: 'Pintura suave, artística e fluida.' },
    { id: 'noir_cartoon', label: 'Cartoon Noir', icon: Eye, color: 'from-gray-700 to-black', desc: 'Desenho animado em P&B com alto contraste.' },
    { id: 'comic', label: 'Comic Book', icon: MessageSquare, color: 'from-yellow-400 to-red-500', desc: 'Estilo de HQ americana com hachuras e onomatopeias.' },
    { id: 'realistic', label: 'Fotorealista', icon: Camera, color: 'from-slate-300 to-slate-500', desc: 'Imagens que parecem fotografias da vida real.' },
    { id: 'cyber_art', label: 'Neon Digital', icon: Cpu, color: 'from-fuchsia-500 to-purple-600', desc: 'Arte futurista com brilhos neon e luzes intensas.' },
    { id: 'pixel_art', label: 'Pixel Art', icon: Gamepad2, color: 'from-green-400 to-lime-500', desc: 'Estilo retrô de jogos de 16-bit e 32-bit.' },
    { id: 'oil_painting', label: 'Pintura a Óleo', icon: Brush, color: 'from-amber-700 to-yellow-900', desc: 'Textura clássica de tela e pinceladas visíveis.' },
    { id: 'sketch_pencil', label: 'Esboço a Lápis', icon: PenTool, color: 'from-slate-400 to-slate-200', desc: 'Desenho feito a grafite com sombreado manual.' },
    { id: 'low_poly', label: 'Low Poly 3D', icon: Hexagon, color: 'from-emerald-400 to-blue-500', desc: 'Visual geométrico de jogos indie modernos.' },
    { id: 'pop_art', label: 'Pop Art', icon: Sun, color: 'from-red-400 to-yellow-300', desc: 'Estilo Andy Warhol com cores saturadas e padrões.' },
    { id: 'cyberpunk_glitch', label: 'Glitch Art', icon: Terminal, color: 'from-cyan-400 to-fuchsia-500', desc: 'Arte digital com distorções e estética hacker.' },
    { id: 'paper_cutout', label: 'Papel Recortado', icon: Scissors, color: 'from-orange-300 to-rose-400', desc: 'Cenários montados com camadas de papel colorido.' },
    { id: 'minecraft_voxel', label: 'Voxel (Blocos)', icon: Box, color: 'from-green-600 to-stone-500', desc: 'Mundo construído inteiramente com cubos 3D.' },
];

const GENRES = [
    { id: 'epic', label: 'Aventura Épica' },
    { id: 'comedy', label: 'Comédia' },
    { id: 'romance', label: 'Romance' },
    { id: 'mystery', label: 'Mistério' },
    { id: 'horror', label: 'Terror' },
    { id: 'scifi', label: 'Ficção Científica' },
    { id: 'fantasy', label: 'Fantasia' },
    { id: 'drama', label: 'Drama' },
    { id: 'fable', label: 'Fábula Moral' },
    { id: 'thriller', label: 'Suspense' },
    { id: 'action', label: 'Ação' },
    { id: 'pirate', label: 'Pirata' },
    { id: 'sports', label: 'Esporte' },
    { id: 'survival', label: 'Sobrevivência' },
    { id: 'spy', label: 'Espionagem' },
    { id: 'superhero', label: 'Super-heróis' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'western', label: 'Faroeste' },
];

const GENRE_PROMPTS = {
    epic: [
        "A busca por um artefato lendário que pode salvar o reino.",
        "A queda de um império e o nascimento de um novo líder.",
        "Uma odisseia mágica através de portais proibidos.",
        "A defesa de uma fortaleza contra uma horda impossível.",
        "O despertar de uma criatura ancestral que dormia sob as montanhas.",
        "Uma jornada solitária para acender a última chama do mundo.",
        "A reunião de cinco clãs rivais para vencer uma sombra comum.",
        "O resgate de uma linhagem real esquecida há séculos.",
        "Uma expedição naval em busca de um continente mítico.",
        "A guerra final entre deuses e mortais pelo destino da terra."
    ],
    comedy: [
        "Um dia inteiro onde tudo o que você diz vira piada.",
        "O herói descobre que seu superpoder é invocar patos.",
        "Uma troca de corpos entre um guerreiro e um vilão atrapalhado.",
        "Organizar um casamento no meio de uma invasão alienígena.",
        "Um robô que tenta aprender a contar piadas, mas é literal demais.",
        "Uma viagem de carro onde o GPS tenta te matar de rir.",
        "O vilão desiste do mal para abrir uma padaria de cupcakes.",
        "Confusão em uma convenção de magos que perderam suas varinhas.",
        "Um feitiço de amor que atrai apenas animais selvagens.",
        "O dia em que a gravidade resolveu tirar folga por uma hora."
    ],
    romance: [
        "Amor proibido entre membros de facções rivais no espaço.",
        "Um reencontro em uma livraria mágica que prevê o futuro.",
        "Uma viagem no tempo para salvar o primeiro amor da infância.",
        "Cartas de amor encontradas em uma garrafa no meio de um oceano digital.",
        "Paixão em um baile de máscaras onde ninguém revela a face.",
        "Dois estranhos presos em uma estação de trem isolada pela neve.",
        "O amor que floresce durante a reconstrução de um reino destruído.",
        "Um pacto de casamento para unir dois mundos em guerra eterna.",
        "A busca pela pessoa que aparece nos seus sonhos todas as noites.",
        "Um robô e uma IA que descobrem sentimentos através de música."
    ],
    mystery: [
        "O desaparecimento de um relógio que para o tempo.",
        "Assassinato em um trem expresso intergaláctico.",
        "Uma mensagem cifrada escondida em uma pintura renascentista.",
        "O mistério do vilarejo onde ninguém consegue dormir.",
        "Um detetive que só resolve crimes que ainda não aconteceram.",
        "O sumiço da biblioteca que continha todos os segredos do mundo.",
        "Uma herança deixada por um parente que nunca existiu no registro.",
        "Um rastro de pegadas que termina no meio de uma parede sólida.",
        "Uma cidade que aparece no mapa apenas durante o eclipse total.",
        "O enigma da voz que fala através das sombras de uma mansão."
    ],
    horror: [
        "Uma casa que muda sua arquitetura interna todas as noites.",
        "O reflexo no espelho que começa a agir de forma independente.",
        "Um vilarejo onde as sombras das pessoas fogem ao pôr do sol.",
        "Um aplicativo que mostra exatamente como o usuário vai morrer.",
        "Uma floresta onde as árvores sussurram seus segredos obscuros.",
        "O brinquedo antigo que aparece em todos os cômodos da casa.",
        "Uma névoa vermelha que traz de volta o que foi enterrado.",
        "O som de passos pesados no sótão de uma mansão vazia.",
        "Uma criatura que se alimenta das memórias felizes das vítimas.",
        "A porta que nunca deve ser aberta, mesmo que algo bata nela."
    ],
    scifi: [
        "A primeira colônia humana em um planeta feito de cristal.",
        "Uma rebelião de androides por direitos básicos de existência.",
        "O envio de uma mensagem para o passado através de um buraco negro.",
        "Um mundo onde a consciência humana é carregada em uma nuvem.",
        "O encontro com uma civilização que vive no núcleo de uma estrela.",
        "Uma nave à deriva carregando o último frasco de DNA terrestre.",
        "A invenção de um chip que permite a tradução universal de animais.",
        "Uma guerra por recursos hídricos em um sistema solar seco.",
        "O dia em que a internet ganhou consciência e parou o mundo.",
        "A descoberta de uma megaestrutura alienígena na face oculta da Lua."
    ],
    fantasy: [
        "Um jovem descobre ser o último guardião de um ovo de dragão.",
        "Uma escola de magia escondida dentro de uma árvore milenar.",
        "A busca pela espada que pode cortar a própria realidade.",
        "Um reino onde as cores das flores definem os poderes do povo.",
        "O despertar de um deus adormecido sob uma metrópole moderna.",
        "Uma jornada ao submundo para negociar uma alma perdida.",
        "O conflito entre o exército da luz e as sombras do abismo.",
        "Uma maldição que transforma todas as palavras em pedras preciosas.",
        "A ponte de arco-íris que conecta o mundo humano ao reino elfo.",
        "O mercado mágico onde se pode comprar e vender tempo de vida."
    ],
    drama: [
        "A luta de um pai para salvar o filho em um mundo em colapso.",
        "O peso de uma escolha que mudou o destino de uma família.",
        "A superação de um trauma através da arte em uma cidade cinza.",
        "O reencontro de dois irmãos que não se falavam há décadas.",
        "A solidão de ser o último habitante de uma cidade abandonada.",
        "O sacrifício de um líder para garantir a sobrevivência do povo.",
        "A busca por perdão após um erro cometido na juventude.",
        "A amizade improvável entre uma criança e um veterano de guerra.",
        "O dilema ético de um médico em meio a uma epidemia global.",
        "A descoberta de uma verdade dolorosa escondida por gerações."
    ],
    fable: [
        "O rei que queria possuir o sol e acabou na escuridão eterna.",
        "A árvore que se recusava a dar frutos para quem não agradecia.",
        "O viajante que trocou sua sombra por sabedoria e se arrependeu.",
        "O rio que parou de correr para ver se sentiriam sua falta.",
        "A raposa que tentou enganar a morte com uma charada.",
        "O espelho que só mostrava a verdadeira alma de quem o olhasse.",
        "O homem que acumulou tanto ouro que não conseguia mais andar.",
        "A criança que ensinou a floresta antiga a cantar novamente.",
        "O pássaro que voou tão alto que viu o início de tudo.",
        "O segredo da felicidade guardado por um humilde camponês."
    ],
    thriller: [
        "Preso em um elevador com alguém que você suspeita ser um espião.",
        "Uma contagem regressiva anônima enviada para o seu celular.",
        "O vizinho que enterra algo estranho no jardim todas as madrugadas.",
        "Receber fotos suas tiradas de dentro da sua própria casa.",
        "Um jogo de gato e rato em um shopping fechado durante a noite.",
        "O único sobrevivente de um acidente que não se lembra de nada.",
        "Um segredo guardado por uma cidade inteira que começa a vazar.",
        "Ser vigiado por alguém através das câmeras de segurança da rua.",
        "O telefone que toca com a voz de alguém que já morreu.",
        "Um rastro de pistas deixado por um sequestrador em lugares públicos."
    ],
    action: [
        "Uma perseguição de carros em alta velocidade por uma metrópole futurista.",
        "A invasão de uma base inimiga para recuperar ogivas roubadas.",
        "Um mestre de artes marciais enfrentando um exército sozinho.",
        "Fuga desesperada de um prédio em chamas cercado por mercenários.",
        "O roubo impossível de um cassino flutuante no meio do oceano.",
        "Um duelo de espadas sobre o teto de um trem em movimento.",
        "Sobreviver a um desastre natural enquanto é caçado por vilões.",
        "A missão secreta para resgatar um embaixador em território hostil.",
        "Uma batalha épica entre tanques e aviões em um deserto escaldante.",
        "O herói que precisa desativar uma bomba enquanto luta contra o tempo."
    ],
    pirate: [
        "A busca por um mapa que leva a um tesouro de tempo, não de ouro.",
        "Um navio fantasma que só aparece sob o brilho de uma lua de sangue.",
        "A jornada para encontrar a lendária ilha que muda de posição no mapa.",
        "Um jovem grumete que descobre ter o poder de controlar as correntes marinhas.",
        "Dois capitães rivais forçados a unir-se para derrotar um Kraken colossal.",
        "A caçada pelo 'Canto da Sereia', uma melodia mística que acalma tempestades.",
        "Um navio pirata voador que saqueia reinos escondidos acima das nuvens.",
        "Ouro amaldiçoado que transforma a tripulação em sombras vivas durante a noite.",
        "Um código pirata ancestral que, se quebrado, invoca o julgamento de um Leviatã.",
        "A busca pela bússola mágica que aponta para o que o coração mais deseja."
    ],
    sports: [
        "O time de azarões que chega à final do campeonato mundial.",
        "Um jogador descobre um talento oculto para um esporte proibido.",
        "A rivalidade histórica entre dois capitães que são melhores amigos.",
        "Treinar uma equipe de robôs para jogar o esporte favorito dos humanos.",
        "A jornada de superação de um atleta após uma lesão grave.",
        "Um campeonato de futebol onde o campo muda de gravidade.",
        "A busca pela bola de ouro que confere habilidades sobre-humanas.",
        "Um jovem da periferia que se torna a maior promessa do basquete.",
        "O torneio de vôlei que unirá duas cidades em pé de guerra.",
        "A última corrida de um piloto lendário de Fórmula 1."
    ],
    survival: [
        "Preso em uma ilha deserta após um naufrágio misterioso.",
        "Sobreviver a uma nevasca eterna em um abrigo subterrâneo.",
        "A fuga de um labirinto mortal que se fecha a cada hora.",
        "Cruzar um deserto sem fim com apenas um litro de água.",
        "Escapar de uma cidade tomada por uma horda de infectados.",
        "Sobreviver a uma queda de avião em uma selva de dinossauros.",
        "A luta pela vida em uma caverna profunda que está inundando.",
        "Manter-se vivo em uma estação espacial com os sistemas falhando.",
        "Fugir de um predador implacável em uma floresta escura e densa.",
        "A jornada de um grupo de refugiados em busca de uma terra segura."
    ],
    spy: [
        "Infiltrar-se em um baile de gala para roubar segredos de Estado.",
        "O agente secreto que descobre que sua agência foi corrompida.",
        "Uma rede de espiões que utiliza sonhos para passar informações.",
        "O jogo de traições entre agentes infiltrados em uma máfia internacional.",
        "Recuperar um satélite de espionagem antes que caia em mãos erradas.",
        "O uso de gadgets futuristas para invadir um bunker inexpugnável.",
        "Uma missão de vigilância que revela uma conspiração global.",
        "O espião aposentado que é forçado a voltar para uma última missão.",
        "Troca de identidades em uma estação de esqui na Suíça.",
        "O código secreto escondido em uma frequência de rádio esquecida."
    ],
    superhero: [
        "Um herói que perdeu seus poderes e precisa aprender a ser humanos.",
        "O surgimento do primeiro supervilão em uma cidade pacata.",
        "A formação de uma liga de heróis para deter uma ameaça cósmica.",
        "Um adolescente que descobre seus poderes no meio de uma aula.",
        "O dilema de um herói que precisa escolher entre o amor e a cidade.",
        "Uma escola para jovens com habilidades extraordinárias.",
        "A origem secreta de um justiceiro que atua nas sombras.",
        "O conflito entre heróis que discordam sobre o uso da força.",
        "O herói que é injustamente acusado de um crime que não cometeu.",
        "A busca por um sucessor para o maior protetor da Terra."
    ],
    cyberpunk: [
        "Um hacker infiltrado na rede neural da maior megacorporação.",
        "A vida de um detetive em uma cidade onde nunca para de chover neon.",
        "A busca por uma IA que fugiu para a web profunda em busca de liberdade.",
        "O mercado negro de memórias e experiências humanas.",
        "A luta de uma classe baixa ciborgue contra a elite tecnológica.",
        "Um robô que começa a sonhar e é caçado pela polícia.",
        "O uso de implantes cerebrais para viver uma realidade paralela.",
        "A descoberta de uma planta real em uma cidade feita de metal.",
        "Um crime cometido em um mundo virtual que afeta a vida real.",
        "A rebelião dos desconectados contra o sistema de vigilância total."
    ],
    western: [
        "Um pistoleiro solitário em busca de vingança em uma cidade sem lei.",
        "O assalto a um trem carregado de ouro no meio do deserto.",
        "A disputa por terras férteis entre xerifes e bandoleiros.",
        "A lenda do cavalo fantasma que protege os viajantes da trilha.",
        "Um duelo ao meio-dia em uma praça poeirenta e silenciosa.",
        "O mistério de uma mina de ouro amaldiçoada.",
        "Uma jornada de escolta através de território hostil.",
        "O bando de foras da lei que decide se tornar herói por um dia.",
        "A construção da primeira ferrovia em meio a traições e ataques.",
        "O segredo escondido no porão do saloon mais movimentado da cidade."
    ]
};

const PROMPTS = [
    "Uma jornada para recuperar um artefato perdido que controla o tempo.",
    "Um mal-entendido leva a uma aliança improvável entre inimigos.",
    "Uma descoberta científica muda tudo o que sabemos sobre a realidade.",
    "Em um mundo onde a música é magia, alguém perdeu sua voz.",
    "Uma festa surpresa que acaba salvando o reino de uma invasão."
];

export default function StoryWizard({ onNext, onBack }) {
    const { startGeneration, selectedCharacters } = useStory();
    const carouselRef = useRef(null);

    const [data, setData] = useState({
        universe: UNIVERSES[0]?.id || 'fantasy_medieval',
        style: 'universe_default',
        genre: null,
        description: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isUniverseOpen, setIsUniverseOpen] = useState(true);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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
        const genrePrompts = data.genre ? (GENRE_PROMPTS[data.genre] || PROMPTS) : PROMPTS;
        const random = genrePrompts[Math.floor(Math.random() * genrePrompts.length)];
        setData(prev => ({ ...prev, description: random }));
    };

    const filteredUniverses = useMemo(() => {
        if (!searchTerm.trim()) return UNIVERSES;
        const term = searchTerm.toLowerCase();
        return UNIVERSES.filter(u =>
            u.label.toLowerCase().includes(term) || u.desc.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    const currentUniverse = useMemo(() => {
        return UNIVERSES.find(u => u.id === data.universe) || UNIVERSES[0];
    }, [data.universe]);

    const currentGenre = useMemo(() => {
        return GENRES.find(g => g.id === data.genre);
    }, [data.genre]);

    const currentStyle = useMemo(() => {
        return STYLES.find(s => s.id === data.style) || STYLES[0];
    }, [data.style]);

    const scrollCarousel = (offset) => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ top: offset, behavior: 'smooth' });
        }
    };

    const handleCreateStory = () => {
        if (!data.universe || !data.genre) return;

        // Merge character details with selectedCharacters
        const charactersWithDetails = selectedCharacters.map(char => {
            const details = characterDetails.find(d => d.id === char.id) || {};
            return {
                ...char,
                customRole: details.role,
                customNickname: details.nickname,
                customPersonality: details.personality
            };
        });

        // Finalize
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
        <div className="min-h-screen flex flex-col items-center pt-6 px-4 pb-28 relative font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Soft Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

            <BackButton onClick={onBack} />

            <main className="w-full max-w-6xl z-10 flex flex-col gap-6 mt-14 sm:mt-6">
                {/* Cabeçalho */}
                <div className="text-center space-y-1">
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-400 bg-white/70 px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm inline-flex items-center gap-1.5">
                        <Sparkles size={14} className="text-magic-pink" />
                        Criação da História
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-slate-800">
                        Configure Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-magic-emerald">Aventura</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                        Escolha o universo no carrossel, selecione o tema e crie o seu livro em uma única tela.
                    </p>
                </div>

                {/* Dashboard Grid (2 Colunas Principais) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* COLUNA ESQUERDA: Carrossel Vertical de Universos (lg:col-span-5) */}
                    <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-5 relative overflow-hidden transition-all duration-300">
                        {/* Header do Carrossel */}
                        <div className="flex items-center justify-between gap-2">
                            <div
                                onClick={() => setIsUniverseOpen(!isUniverseOpen)}
                                className="flex items-center gap-2.5 cursor-pointer select-none group"
                            >
                                <div className="w-8 h-8 rounded-xl bg-pink-100 text-magic-pink flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                                    1
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-heading font-bold text-slate-800 text-base leading-tight">Universo</h2>
                                        {!isUniverseOpen && (
                                            <span className="text-[11px] font-bold text-magic-pink bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded-full">
                                                {currentUniverse.label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        {isUniverseOpen ? 'Gire a roleta ou clique para escolher' : 'Toque para trocar o universo'}
                                    </p>
                                </div>
                            </div>

                            {/* Controles do topo */}
                            <div className="flex items-center gap-1.5">
                                {isUniverseOpen && (
                                    <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => scrollCarousel(-120)}
                                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                                            title="Rolar para cima"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => scrollCarousel(120)}
                                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-all cursor-pointer"
                                            title="Rolar para baixo"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsUniverseOpen(!isUniverseOpen)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    title={isUniverseOpen ? "Recolher roleta" : "Abrir roleta"}
                                >
                                    <span>{isUniverseOpen ? 'Fechar' : 'Trocar'}</span>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUniverseOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* ESTADO FECHADO: Resumo compacto elegante com botão de trocar */}
                        {!isUniverseOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsUniverseOpen(true)}
                                className="mt-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/70 to-slate-50 border border-pink-200/80 hover:border-magic-pink transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${currentUniverse.color} flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                        <currentUniverse.icon size={22} className="drop-shadow-sm" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-sm truncate">{currentUniverse.label}</h3>
                                            <span className="text-[10px] font-bold text-magic-pink bg-pink-100 px-2 py-0.5 rounded-full shrink-0">
                                                Ativo
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate">{currentUniverse.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-magic-pink bg-white px-2.5 py-1 rounded-xl border border-pink-200/80 shadow-xs shrink-0 group-hover:bg-pink-50 transition-colors">
                                    <span>Trocar</span>
                                    <ChevronRight size={13} />
                                </div>
                            </motion.div>
                        )}

                        {/* ESTADO ABERTO: Busca + Roleta vertical com snap */}
                        <AnimatePresence>
                            {isUniverseOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden flex flex-col pt-3"
                                >
                                    {/* Barra de Busca de Universos */}
                                    <div className="relative mb-3">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar entre 45 universos..."
                                            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-7 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-magic-pink focus:ring-1 focus:ring-pink-100 transition-all"
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Roleta / Carrossel Vertical com Snap */}
                                    <div className="relative min-h-[300px] max-h-[360px]">
                                        {/* Gradientes para efeito roleta / slot machine */}
                                        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
                                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

                                        <div
                                            ref={carouselRef}
                                            className="h-[340px] overflow-y-auto space-y-2 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-y snap-mandatory"
                                        >
                                            {filteredUniverses.map((u) => {
                                                const isSelected = data.universe === u.id;
                                                return (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => {
                                                            handleSelect('universe', u.id);
                                                            setIsUniverseOpen(false); // Fecha o widget após selecionar
                                                        }}
                                                        className={`snap-center cursor-pointer p-2.5 rounded-2xl flex items-center gap-3 transition-all duration-200 select-none ${
                                                            isSelected
                                                                ? 'bg-pink-50/90 border-2 border-magic-pink shadow-md scale-[1.01]'
                                                                : 'bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center text-white shrink-0 shadow-sm ${isSelected ? 'scale-105' : ''}`}>
                                                            <u.icon size={22} className="drop-shadow-sm" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-magic-pink' : 'text-slate-800'}`}>
                                                                {u.label}
                                                            </h3>
                                                            <p className="text-[11px] text-slate-400 truncate">{u.desc}</p>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-magic-pink text-white flex items-center justify-center text-[10px] shrink-0 font-bold shadow-sm">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {filteredUniverses.length === 0 && (
                                                <div className="text-center py-12 text-slate-400 text-xs">
                                                    Nenhum universo encontrado para "{searchTerm}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botão de Fechar / Confirmar seleção */}
                                    <button
                                        type="button"
                                        onClick={() => setIsUniverseOpen(false)}
                                        className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Confirmar {currentUniverse.label}</span>
                                        <Check size={14} className="text-magic-pink" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* COLUNA DIREITA: Escolha do Tema & Ideia da História (lg:col-span-7) */}
                    <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 justify-between gap-5">
                        <div>
                            {/* Header da Seção de Tema */}
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-magic-emerald flex items-center justify-center font-bold text-sm">
                                    2
                                </div>
                                <div>
                                    <h2 className="font-heading font-bold text-slate-800 text-base leading-tight">Tema & Trama</h2>
                                    <p className="text-[11px] text-slate-400">Escolha o gênero principal da narrativa</p>
                                </div>
                            </div>

                            {/* Pills de Gênero */}
                            <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {GENRES.map((g) => {
                                    const isSelected = data.genre === g.id;
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => handleSelect('genre', g.id)}
                                            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-magic-pink to-rose-500 text-white border-transparent shadow-md shadow-pink-200/50 scale-105'
                                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-600 hover:text-slate-800'
                                            }`}
                                        >
                                            {g.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ideia da História (Opcional) */}
                        <div className="space-y-1.5 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Ideia da História (Opcional)
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRandomPrompt}
                                    className="text-xs font-bold text-magic-pink hover:text-pink-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    title="Sugerir ideia aleatória para o tema escolhido"
                                >
                                    <Shuffle size={13} />
                                    Sortear Ideia
                                </button>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={data.description}
                                    onChange={(e) => handleSelect('description', e.target.value)}
                                    placeholder={
                                        data.genre
                                            ? `Escreva um detalhe especial para esta aventura de ${currentGenre?.label || 'história'} ou clique em 'Sortear Ideia' para a IA sugerir...`
                                            : "Selecione um tema acima para desbloquear ideias sugeridas..."
                                    }
                                    className="w-full h-28 bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-magic-pink focus:ring-1 focus:ring-pink-100 resize-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEÇÃO EXPANSÍVEL: Opções Avançadas (Estilo Visual & Heróis) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
                    <button
                        type="button"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Cog size={18} />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                                    Opções Avançadas
                                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                        Opcional
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Estilo visual ({currentStyle.label}) {selectedCharacters.length > 0 ? `• ${selectedCharacters.length} herói(s) selecionado(s)` : ''}
                                </p>
                            </div>
                        </div>
                        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isAdvancedOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden border-t border-slate-100 p-5 sm:p-6 space-y-6 bg-slate-50/40"
                            >
                                {/* 1. Seletor de Estilo Visual */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-800">Estilo Visual das Ilustrações</h4>
                                            <p className="text-xs text-slate-400">Por padrão, usamos a arte autêntica do universo</p>
                                        </div>
                                        <span className="text-xs font-bold text-magic-emerald bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                            Ativo: {currentStyle.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                        {STYLES.map((s) => {
                                            const isStyleSelected = data.style === s.id;
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => handleSelect('style', s.id)}
                                                    className={`p-2.5 rounded-2xl flex flex-col items-center text-center gap-1.5 transition-all border cursor-pointer ${
                                                        isStyleSelected
                                                            ? 'bg-white border-2 border-magic-emerald shadow-md ring-2 ring-emerald-50'
                                                            : 'bg-white/80 hover:bg-white border-slate-200/70 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0 shadow-sm ${isStyleSelected ? 'scale-105' : ''}`}>
                                                        <s.icon size={18} />
                                                    </div>
                                                    <span className={`font-bold text-xs truncate w-full ${isStyleSelected ? 'text-magic-emerald' : 'text-slate-700'}`}>
                                                        {s.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 2. Personalização dos Heróis */}
                                {selectedCharacters.length > 0 && (
                                    <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {selectedCharacters.map(char => (
                                                    <img
                                                        key={char.id}
                                                        src={char.avatar || (char.photos && char.photos[0]) || "https://placehold.co/100x120/e2e8f0/cbd5e1"}
                                                        alt={char.nickname}
                                                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm"
                                                    />
                                                ))}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800">
                                                    Heróis da Aventura ({selectedCharacters.map(c => c.nickname).join(', ')})
                                                </h4>
                                                <p className="text-xs text-slate-400">Atribua papéis personalizados (ex: Mago, Comandante, Vilão)</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowCharacterModal(true)}
                                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-magic-pink hover:text-magic-pink transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                                        >
                                            <Users size={15} />
                                            Personalizar Heróis
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* BARRA FIXA / CARD DE AÇÃO */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentUniverse.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                            <currentUniverse.icon size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm sm:text-base">{currentUniverse.label}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-bold text-magic-pink text-xs sm:text-sm">
                                    {currentGenre ? currentGenre.label : 'Selecione um tema'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Estilo: <span className="font-medium text-slate-600">{currentStyle.label}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateStory}
                        disabled={!isReady}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-xl ${
                            isReady
                                ? 'bg-gradient-to-r from-magic-pink to-magic-emerald text-white hover:scale-105 active:scale-95 shadow-pink-200 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <span>Criar Livro Mágico ✨</span>
                        <Wand2 size={20} />
                    </button>
                </div>
            </main>

            {/* Modal de Personalização dos Heróis */}
            <AnimatePresence>
                {showCharacterModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pt-24 pb-8 p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCharacterModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-bold font-heading text-slate-800">
                                        Personalizar <span className="text-magic-pink">Heróis</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Preencha os campos para mudar como eles agem ou quem eles são na sua história (tudo é livre e opcional).</p>
                                </div>
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body / Scrollable Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {selectedCharacters.map((char) => {
                                    const details = characterDetails.find(d => d.id === char.id) || {};
                                    return (
                                        <div key={char.id} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 shadow-sm relative overflow-hidden group">
                                            {/* Decorative colored edge */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-magic-pink/20 to-magic-emerald/20 group-hover:from-magic-pink group-hover:to-magic-emerald transition-all duration-300" />

                                            {/* Avatar Info */}
                                            <div className="flex flex-col items-center gap-3 w-full sm:w-[140px] shrink-0">
                                                <div className="w-24 sm:w-28 md:w-32 aspect-[3/4] rounded-2xl overflow-hidden border-[3px] border-white shadow-md relative group/photo">
                                                    <img
                                                        src={char.avatar || (char.photos && char.photos[0]) || "https://placehold.co/100x120/e2e8f0/cbd5e1"}
                                                        alt={char.nickname}
                                                        className="absolute inset-0 w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <span className="font-bold text-sm text-slate-700 text-center px-2">{char.nickname}</span>
                                            </div>

                                            {/* Inputs */}
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5 border border-slate-100 bg-white p-3 rounded-xl hover:border-pink-200 hover:shadow-sm transition-all focus-within:border-magic-pink focus-within:ring-2 focus-within:ring-pink-50">
                                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 pl-1">Apelido na História</label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Ex: O Grande ${char.nickname}`}
                                                        value={details.nickname}
                                                        onChange={(e) => handleCharacterDetailChange(char.id, 'nickname', e.target.value)}
                                                        className="w-full bg-transparent px-1 py-1 text-sm font-medium text-slate-700 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 border border-slate-100 bg-white p-3 rounded-xl hover:border-magic-emerald hover:shadow-sm transition-all focus-within:border-magic-emerald focus-within:ring-2 focus-within:ring-emerald-50">
                                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 pl-1">Papel (Herói, Vilão...)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Mago Guardião"
                                                        value={details.role}
                                                        onChange={(e) => handleCharacterDetailChange(char.id, 'role', e.target.value)}
                                                        className="w-full bg-transparent px-1 py-1 text-sm font-medium text-slate-700 outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1.5 border border-slate-100 bg-white p-3 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all md:col-span-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50">
                                                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 pl-1">Personalidade</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Corajoso, impulsivo, adora contar piadas ruins em batalhas"
                                                        value={details.personality}
                                                        onChange={(e) => handleCharacterDetailChange(char.id, 'personality', e.target.value)}
                                                        className="w-full bg-transparent px-1 py-1 text-sm font-medium text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all text-sm cursor-pointer"
                                >
                                    Sair
                                </button>
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-magic-pink to-magic-emerald text-white font-bold hover:shadow-md hover:-translate-y-0.5 transition-all text-sm cursor-pointer"
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
