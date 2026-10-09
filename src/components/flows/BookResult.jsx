import React, { useRef, useMemo, forwardRef, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Check } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import { useAuth } from '../../context/AuthContext';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';
import BackButton from '../ui/BackButton';
// --- Components ---

// 1. Capa (Hardcover) - Mantendo um tone mais sóbrio mas harmonioso
const Cover = forwardRef((props, ref) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="demoPage bg-[#f3eee0] h-full overflow-hidden relative shadow-2xl flex flex-col items-center p-2"
            ref={ref}
            data-density="hard"
            style={props.style}
        >
            {/* Texture Overlay (Paper) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-30 mix-blend-multiply pointer-events-none z-0"></div>

            {/* Maximized Framed Illustration (95%) */}
            <div className="relative z-10 w-full h-[95%] group">
                <div className="absolute inset-0 bg-white/40 blur-xl scale-110 opacity-50"></div>
                <div className="relative w-full h-full overflow-hidden rounded-[2rem] border-8 border-[#f3eee0] shadow-xl ring-1 ring-black/5">
                    {props.image && !imgError ? (
                        <img
                            src={props.image}
                            alt="Capa do Livro"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.error("Erro ao carregar capa:", props.image);
                                setImgError(true);
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-[#f3eee0] flex items-center justify-center p-4 text-center">
                            <span className="text-[#789D63]/30 font-serif italic text-sm">
                                {imgError ? "Ilustração indisponível" : "Preparando Capa..."}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stylized Title Box Centered on Page (Positioned at 91/100 as per manual adjustment) */}
            <div className="absolute top-[91%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[85%] flex flex-col items-center">
                <div
                    className="bg-[#789D63]/90 backdrop-blur-sm text-[#f3eee0] shadow-2xl text-center border border-white/20 min-w-full"
                    style={{
                        padding: 'calc(var(--book-font-size, 16px) * 0.75) calc(var(--book-font-size, 16px) * 1.2)',
                        borderRadius: 'calc(var(--book-font-size, 16px) * 1.2)'
                    }}
                >
                    <h1
                        className="font-serif font-bold leading-tight drop-shadow-md text-balance italic"
                        style={{
                            fontSize: 'calc(var(--book-font-size, 16px) * 1.8)',
                            lineHeight: 1.2
                        }}
                    >
                        {props.title || "Conto Sem Título"}
                    </h1>
                </div>

                {/* Author Footer (Below the centered box) */}
                <div className="mt-3">
                    <span
                        className="text-[#f3eee0] drop-shadow-lg font-serif italic bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm"
                        style={{
                            fontSize: 'calc(var(--book-font-size, 16px) * 0.82)'
                        }}
                    >
                        Escrito por sua Imaginação
                    </span>
                </div>
            </div>

            {/* Spine Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/20 to-transparent z-30 pointer-events-none"></div>
        </div>
    );
});

Cover.displayName = 'Cover';

const TextPage = forwardRef((props, ref) => {
    const rawText = typeof props.children === 'string' ? props.children : '';
    // Separa parágrafos por quebras duplas ou quebras de linha com espaços
    const paragraphs = rawText
        ? rawText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0)
        : [rawText];

    return (
        <div
            className="demoPage h-full bg-[#fdfbf7] border-l border-[#e3dccb] overflow-hidden relative flex flex-col"
            ref={ref}
            style={props.style}
        >
            {/* Texture Overlay (Paper) */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-40 mix-blend-multiply pointer-events-none z-0"></div>

            {/* Sombra interna da dobra (gutter direcional para página esquerda) */}
            <div className="absolute left-0 top-0 bottom-0 w-[30px] bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-10"></div>

            <div
                className="relative z-20 h-full flex flex-col justify-start"
                style={{
                    padding: 'calc(var(--book-font-size, 16px) * 0.4) calc(var(--book-font-size, 16px) * 0.5)'
                }}
            >
                <div
                    className="flex items-center justify-between border-b-2 border-slate-200 shrink-0"
                    style={{
                        margin: 'calc(var(--book-font-size, 16px) * 0.4) calc(var(--book-font-size, 16px) * 0.8) calc(var(--book-font-size, 16px) * 0.4) calc(var(--book-font-size, 16px) * 0.8)',
                        paddingBottom: 'calc(var(--book-font-size, 16px) * 0.3)'
                    }}
                >
                    <span
                        className="font-serif italic text-slate-400"
                        style={{ fontSize: 'calc(var(--book-font-size, 16px) * 0.82)' }}
                    >
                        Capítulo {props.chapter}
                    </span>
                    <span
                        className="font-serif font-bold text-slate-300"
                        style={{ fontSize: 'calc(var(--book-font-size, 16px) * 0.75)' }}
                    >
                        {props.number}
                    </span>
                </div>

                <div
                    className="font-serif text-justify tracking-[0.012em] text-slate-800 overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin scrollbar-thumb-stone-300/70 hover:scrollbar-thumb-stone-400"
                    style={{
                        fontSize: 'var(--book-font-size, 16px)',
                        lineHeight: 1.68,
                        paddingLeft: 'calc(var(--book-font-size, 16px) * 0.8)',
                        paddingRight: 'calc(var(--book-font-size, 16px) * 0.8)',
                        paddingBottom: 'calc(var(--book-font-size, 16px) * 0.5)'
                    }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    {paragraphs.map((para, index) => {
                        if (index === 0) {
                            return (
                                <p
                                    key={index}
                                    style={{ marginBottom: 'calc(var(--book-font-size, 16px) * 0.85)' }}
                                >
                                    {/* Letra Capitular Clássica */}
                                    <span
                                        className="float-left font-serif font-bold text-slate-900"
                                        style={{
                                            fontSize: 'calc(var(--book-font-size, 16px) * 2.85)',
                                            lineHeight: 0.85,
                                            marginRight: 'calc(var(--book-font-size, 16px) * 0.35)',
                                            marginTop: '1px'
                                        }}
                                    >
                                        {para.charAt(0)}
                                    </span>
                                    {para.slice(1)}
                                </p>
                            );
                        }
                        return (
                            <p
                                key={index}
                                style={{
                                    marginBottom: 'calc(var(--book-font-size, 16px) * 0.85)',
                                    textIndent: 'calc(var(--book-font-size, 16px) * 1.2)'
                                }}
                            >
                                {para}
                            </p>
                        );
                    })}

                    {/* Footer Deco */}
                    <div
                        className="flex justify-center opacity-30 shrink-0"
                        style={{
                            marginTop: 'calc(var(--book-font-size, 16px) * 0.5)',
                            marginBottom: 'calc(var(--book-font-size, 16px) * 0.25)',
                            fontSize: 'calc(var(--book-font-size, 16px) * 1.1)'
                        }}
                    >
                        ✨
                    </div>
                </div>
            </div>
        </div>
    );
});
TextPage.displayName = 'TextPage';

const ImagePage = forwardRef((props, ref) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div
            className="demoPage h-full bg-[#fdfbf7] border-r border-[#e3dccb] overflow-hidden relative"
            ref={ref}
            style={props.style}
        >
            {/* Sombra interna da dobra (gutter para página da esquerda) */}
            <div className="absolute right-0 top-0 bottom-0 w-[30px] bg-gradient-to-l from-black/15 to-transparent pointer-events-none z-10"></div>

            <div className="relative w-full h-full">
                {props.image && !imgError ? (
                    <img
                        src={props.image}
                        className="w-full h-full object-cover"
                        alt="Ilustração"
                        onError={(e) => {
                            console.error("Erro ao carregar imagem:", props.image);
                            setImgError(true);
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 font-serif text-center p-6 italic">
                        <span>{imgError ? "Imagem indisponível" : "Ilustrando..."}</span>
                    </div>
                )}
                <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.2)] pointer-events-none z-[2]"></div>

                <div className="absolute bottom-4 w-full flex justify-center z-10 pointer-events-none">
                    <span
                        className="bg-black/30 text-white/90 font-serif font-bold rounded-full backdrop-blur-[4px]"
                        style={{
                            fontSize: 'calc(var(--book-font-size, 16px) * 0.72)',
                            padding: 'calc(var(--book-font-size, 16px) * 0.2) calc(var(--book-font-size, 16px) * 0.6)'
                        }}
                    >
                        {props.number}
                    </span>
                </div>
            </div>
        </div>
    );
});
ImagePage.displayName = 'ImagePage';

// 4. Contra-Capa (Leather)
const BackCover = forwardRef((props, ref) => {
    return (
        <div className="demoPage bg-[#1a1a1a] h-full overflow-hidden relative shadow-2xl flex flex-col items-center justify-center border-l-8 border-slate-900" ref={ref} data-density="hard">
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-60 mix-blend-multiply pointer-events-none z-0"></div>
        </div>
    );
});
BackCover.displayName = 'BackCover';

// --- Main Component ---

export default function BookResult({ onClose, story }) {
    const { generationState } = useStory();
    const { currentUser } = useAuth();
    // Prioritize passed story prop, fallback to generation result
    const result = story || generationState.result;
    const bookRef = useRef();
    const [copied, setCopied] = useState(false);

    const storyId = result?.id || result?.storyId || story?.id;
    const userId = result?.userId || story?.userId || currentUser?.uid;

    const handleShare = async () => {
        if (!storyId || !userId) {
            alert("Para compartilhar este livro, certifique-se de que ele esteja salvo na sua biblioteca.");
            return;
        }

        const shareUrl = `${window.location.origin}/?storyId=${storyId}&userId=${userId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: result.title || 'Imaginária - Livro Mágico',
                    text: `Leia esta história mágica: "${result.title}"`,
                    url: shareUrl
                });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return;
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (e) {
            prompt("Copie o link abaixo para compartilhar:", shareUrl);
        }
    };

    // Estado para dimensões responsivas
    const [dimensions, setDimensions] = useState({ width: 650, height: 700, usePortrait: false });

    // Calcula as dimensões ideais baseadas no tamanho da tela
    useEffect(() => {
        const updateDimensions = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Espaços disponíveis (sem descontos, tela toda)
            const availableHeight = viewportHeight * 0.98; // 98% da altura pra sobrar uma microborda
            const availableWidth = viewportWidth * 0.98;

            // Proporção canônica de página de livro vertical (portrait ~0.70)
            // Em desktop, duas páginas lado a lado somam 1.40, encaixando com perfeição em telas 16:9
            // e exibindo as ilustrações verticais (1024x1536, ~0.67) sem nenhum corte (crop) indesejado.
            const targetAspectRatio = 0.70;

            let usePortrait = false;
            let pageWidth, pageHeight;

            if (viewportWidth < 768) {
                // Mobile: 1 página por vez
                usePortrait = true;

                // Tenta ocupar largura total primeiro
                pageWidth = availableWidth;
                pageHeight = pageWidth / targetAspectRatio;

                // Se passou da tela, trava na altura máxima real
                if (pageHeight > availableHeight) {
                    pageHeight = availableHeight;
                    pageWidth = pageHeight * targetAspectRatio;
                }
            } else {
                // Desktop: 2 páginas lado a lado (metade da tela pra cada)
                usePortrait = false;
                const maxDoublePageWidth = availableWidth;

                // Tenta usar TODA a altura
                pageHeight = availableHeight;
                pageWidth = pageHeight * targetAspectRatio;

                // Se estourar a largura pros lados, reduz proporcionalmente
                if (pageWidth * 2 > maxDoublePageWidth) {
                    pageWidth = maxDoublePageWidth / 2;
                    pageHeight = pageWidth / targetAspectRatio;
                }
            }

            setDimensions({
                width: Math.max(Math.floor(pageWidth), 200),
                height: Math.max(Math.floor(pageHeight), 300),
                usePortrait
            });
        };

        updateDimensions();
        // Atualiza ao redimensionar a janela
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Escala tipográfica reativa e proporcional ao tamanho real da folha do livro
    // Celulares (height ~520px) -> 14px (piso confortável de legibilidade)
    // Notebooks (height ~750px) -> ~18px
    // Monitores 1080p (height ~1050px) -> ~25px
    // Monitores 1440p (height ~1400px) -> ~33px
    // Telas 4K / TVs (height ~2100px) -> até 48px (teto harmonioso para leitura à distância)
    const baseFontSize = useMemo(() => {
        return Math.max(14, Math.min(48, Math.round(dimensions.height * 0.0235)));
    }, [dimensions.height]);

    const pages = useMemo(() => {
        if (!result) return [];
        const p = [];

        // Support both new 'pages' format and old 'parts' format (fallback)
        const storyBlocks = result.pages || result.parts || [];

        storyBlocks.forEach((block, index) => {
            const text = block.text || block[0];
            const img = result.chapters?.[index]?.image_url;
            const chapterNum = index + 1;

            // Only add image page if image exists
            if (img) {
                p.push({
                    type: 'image',
                    content: img,
                    chapter: chapterNum,
                    chapterIndex: index,
                    id: `img-${index}`
                });
            }

            p.push({
                type: 'text',
                content: text,
                chapter: chapterNum,
                id: `txt-${index}`
            });
        });

        // Ensure even number of pages for the flipbook inside, otherwise back cover might get weird.
        if (p.length % 2 !== 0) {
            p.push({ type: 'blank', id: 'blank-padding' });
        }

        return p;
    }, [result]);

    useEffect(() => {
        // Pequeno delay para garantir renderização correta das sombras
        const timer = setTimeout(() => {
            if (bookRef.current) {
                // Force update if needed
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Handlers para os botões de navegação
    const nextFlip = () => bookRef.current.pageFlip().flipNext();
    const prevFlip = () => bookRef.current.pageFlip().flipPrev();

    if (!result) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden py-2 md:py-4 bg-black/80 backdrop-blur-sm px-2 md:px-4"
        >
            <BackButton onClick={onClose} />

            {/* Floating Share Button */}
            {storyId && userId && (
                <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[110] flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 shadow-xl font-heading font-medium text-xs md:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Compartilhar link desta história"
                    >
                        {copied ? (
                            <>
                                <Check size={16} className="text-emerald-300" />
                                <span className="text-emerald-200 font-bold">Link Copiado!</span>
                            </>
                        ) : (
                            <>
                                <Share2 size={16} />
                                <span>Compartilhar Livro</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Book Wrapper */}
            <div
                className="relative z-10 flex items-center justify-center"
                style={{
                    '--book-font-size': `${baseFontSize}px`,
                    '--book-page-width': `${dimensions.width}px`,
                    '--book-page-height': `${dimensions.height}px`
                }}
            >

                {/* Navigation Arrows (Desktop) */}
                <button onClick={prevFlip} className="hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:scale-110 transition-all">
                    <ChevronLeft size={48} strokeWidth={1} />
                </button>

                <button onClick={nextFlip} className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:scale-110 transition-all">
                    <ChevronRight size={48} strokeWidth={1} />
                </button>

                {/* The Book */}
                <HTMLFlipBook
                    width={dimensions.width}
                    height={dimensions.height}
                    size="fixed"
                    minWidth={200}
                    maxWidth={4000}
                    minHeight={300}
                    maxHeight={4000}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    ref={bookRef}
                    usePortrait={dimensions.usePortrait}
                    startZIndex={30}
                    autoSize={true}
                    drawShadow={true}
                    flippingTime={1000}
                    useMouseEvents={true}
                >
                    {/* Cover (Page 0) */}
                    <Cover title={result.title} image={result.cover_image} style={{ '--book-font-size': `${baseFontSize}px` }} />

                    {/* Content Pages */}
                    {pages.map((page, i) => {
                        const pageNum = i + 1;
                        if (page.type === 'image') {
                            return <ImagePage key={page.id} number={pageNum} image={page.content} style={{ '--book-font-size': `${baseFontSize}px` }} />;
                        } else if (page.type === 'blank') {
                            return <div key={page.id} className="demoPage bg-[#fdfbf7] h-full border-l border-[#e3dccb]"></div>;
                        } else {
                            return <TextPage key={page.id} number={pageNum} chapter={page.chapter} style={{ '--book-font-size': `${baseFontSize}px` }}>{page.content}</TextPage>;
                        }
                    })}

                    {/* Back Cover */}
                    <BackCover costData={result.cost_data} />

                </HTMLFlipBook>
            </div>

            {/* Mobile Helper */}
            <div className="mt-1 md:mt-2 text-white/50 text-[10px] md:text-xs font-sans tracking-widest pointer-events-none text-center px-4">
                Toque ou arraste para folhear
            </div>

        </motion.div>
    );
}
