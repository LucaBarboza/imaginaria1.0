import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Wand2, Shuffle, Sparkles, Tv, Cpu, Gem, Skull, Compass, Eye, Cog, Wind, Flame, Anchor, Axe, Star, Gamepad2, Sword, Box, FlaskConical, FastForward, CircleDot, Volleyball, CircleDashed, Flag, Bike, Heart, Snowflake, Bone, Bug, Biohazard, Smile, Users, TestTubes, Waves, Search, TreePine, Wrench, Leaf, BoxSelect, Shapes, Palette, MessageSquare, Camera, Brush, PenTool, Hexagon, Sun, Terminal, Scissors, Castle, X } from 'lucide-react';
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
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        universe: null,
        style: null,
        genre: null,
        description: ''
    });

    // Novo estado para customização opcional dos personagens
    const [characterDetails, setCharacterDetails] = useState(
        selectedCharacters.map(char => ({
            id: char.id,
            role: '',
            nickname: '',
            personality: ''
        }))
    );
    const [showCharacterModal, setShowCharacterModal] = useState(false);

    const handleSelect = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleCharacterDetailChange = (charId, field, value) => {
        setCharacterDetails(prev => prev.map(detail =>
            detail.id === charId ? { ...detail, [field]: value } : detail
        ));
    };

    const handleRandomPrompt = () => {
        const genrePrompts = GENRE_PROMPTS[data.genre] || PROMPTS;
        const random = genrePrompts[Math.floor(Math.random() * genrePrompts.length)];
        setData(prev => ({ ...prev, description: random }));
    };

    const handleContinue = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
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
            startGeneration({ ...data, characters: charactersWithDetails });
            onNext();
        }
    };

    const isStepValid = () => {
        if (step === 1) return !!data.universe;
        if (step === 2) return !!data.style;
        if (step === 3) return !!data.genre;
        return false;
    };

    return (
        <div className="min-h-screen flex flex-col items-center pt-8 px-4 pb-20 relative font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Soft Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

            <BackButton onClick={step === 1 ? onBack : () => setStep(step - 1)} />

            {/* Progress */}
            <div className="w-full max-w-2xl flex gap-3 mb-10 z-10 mt-16 md:mt-0">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-gradient-to-r from-magic-pink to-magic-emerald shadow-sm' : 'bg-slate-200'}`} />
                ))}
            </div>

            <div className="w-full max-w-[95%] z-10">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 sm:space-y-8 max-w-6xl xl:max-w-7xl mx-auto"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold font-heading text-center text-slate-800">
                                Escolha o <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-magic-emerald">Universo</span>
                            </h2>
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-2.5 lg:gap-3 justify-items-center">
                                {UNIVERSES.map((u) => (
                                    <motion.button
                                        key={u.id}
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => handleSelect('universe', u.id)}
                                        className={`relative w-full max-w-[105px] sm:max-w-[115px] lg:max-w-[124px] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center transition-all min-h-[105px] sm:min-h-[114px] lg:min-h-[122px] group cursor-pointer ${
                                            data.universe === u.id
                                                ? 'bg-white border-2 border-magic-pink shadow-lg ring-2 ring-pink-100 scale-[1.03]'
                                                : 'bg-white border border-slate-100 hover:border-pink-200 hover:shadow-md shadow-sm'
                                        }`}
                                    >
                                        {/* Icon Container */}
                                        <div
                                            className={`mb-1.5 transition-all duration-300 flex items-center justify-center w-13 h-13 sm:w-15 sm:h-15 lg:w-[68px] lg:h-[68px] rounded-xl sm:rounded-2xl bg-gradient-to-br ${u.color} shadow-sm group-hover:scale-105 ${
                                                data.universe === u.id ? 'scale-105 shadow-pink-200' : ''
                                            }`}
                                        >
                                            <u.icon size={30} className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white drop-shadow-sm" />
                                        </div>

                                        <span
                                            className={`font-bold text-[11px] sm:text-xs lg:text-[13px] leading-tight transition-colors line-clamp-1 w-full px-1 text-center ${
                                                data.universe === u.id ? 'text-magic-pink' : 'text-slate-700'
                                            }`}
                                            title={u.label}
                                        >
                                            {u.label}
                                        </span>

                                        {/* Selected Badge */}
                                        {data.universe === u.id && (
                                            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-magic-pink ring-2 ring-white" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold font-heading text-center text-slate-800">
                                Estilo <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-emerald to-magic-teal">Visual</span>
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                                {STYLES.map((s) => (
                                    <motion.button
                                        key={s.id}
                                        whileHover={{ scale: 1.03, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect('style', s.id)}
                                        className={`relative p-4 rounded-[24px] flex flex-col items-center text-center gap-3 transition-all overflow-hidden h-auto min-h-[180px] group
                                            ${data.style === s.id
                                                ? 'bg-white border-2 border-magic-emerald shadow-lg ring-4 ring-emerald-50'
                                                : 'bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}
                                    >
                                        <div className={`transition-all duration-300 flex items-center justify-center mb-2 w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} shadow-lg
                                            ${data.style === s.id ? 'rotate-3 scale-110' : 'group-hover:scale-105'}`}>
                                            <s.icon size={32} strokeWidth={2.5} className="text-white drop-shadow-md" />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <h3 className={`font-bold text-sm leading-tight transition-colors ${data.style === s.id ? 'text-magic-emerald' : 'text-slate-700'}`}>{s.label}</h3>
                                            <p className="text-[11px] text-slate-400 leading-tight line-clamp-3 group-hover:text-slate-500">{s.desc}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 max-w-4xl mx-auto"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold font-heading text-center text-slate-800">
                                Gênero & <span className="text-transparent bg-clip-text bg-gradient-to-r from-magic-pink to-orange-400">Trama</span>
                            </h2>

                            <div className="space-y-8 bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-100">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Gênero Literário</label>
                                    <div className="flex flex-wrap gap-3">
                                        {GENRES.map((g) => (
                                            <button
                                                key={g.id}
                                                onClick={() => handleSelect('genre', g.id)}
                                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border
                                                    ${data.genre === g.id
                                                        ? 'bg-pink-50 border-pink-200 text-magic-pink shadow-sm ring-2 ring-pink-50'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'}`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* -------- CUSTOMIZAÇÃO DE PERSONAGENS (OPCIONAL) -------- */}
                                {selectedCharacters.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">
                                                    Detalhes dos Personagens (Opcional)
                                                </label>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">Dê papéis, apelidos e defina as personalidades dos heróis da história.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowCharacterModal(true)}
                                                className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm hover:border-magic-pink hover:text-magic-pink transition-all flex items-center gap-2"
                                            >
                                                <Users size={18} />
                                                Personalizar Heróis
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* -------------------------------------------------------- */}

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">
                                        Ideia da História (Opcional)
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => handleSelect('description', e.target.value)}
                                            placeholder="Descreva brevemente sua ideia ou clique no dado para gerar algo aleatório..."
                                            className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 focus:border-magic-pink focus:ring-4 focus:ring-pink-50 focus:outline-none resize-none transition-all placeholder:text-slate-400"
                                        />
                                        <button
                                            onClick={handleRandomPrompt}
                                            className="absolute bottom-4 right-4 p-3 bg-white rounded-xl border border-slate-200 hover:border-magic-pink hover:text-magic-pink transition-all shadow-sm text-slate-400"
                                            title="Gerar ideia aleatória"
                                        >
                                            <Shuffle size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next Button */}
                <div className="mt-12 flex justify-center pb-8">
                    <button
                        onClick={handleContinue}
                        disabled={!isStepValid()}
                        className={`flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-xl
                            ${isStepValid()
                                ? 'bg-gradient-to-r from-magic-pink to-magic-emerald text-white hover:scale-105 hover:shadow-pink-200 hover:-translate-y-1'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span>{step === 3 ? 'Criar História' : 'Próximo'}</span>
                        {step === 3 ? <Wand2 size={22} /> : <ChevronRight size={22} />}
                    </button>
                </div>
            </div>

            {/* Character Customization Modal */}
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
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
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
                                                <div className="space-y-1.5 border border-slate-100 bg-white p-3 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all focus-within:border-magic-emerald focus-within:ring-2 focus-within:ring-emerald-50">
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
                                    className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all text-sm"
                                >
                                    Sair
                                </button>
                                <button
                                    onClick={() => setShowCharacterModal(false)}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-magic-pink to-magic-emerald text-white font-bold hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
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
