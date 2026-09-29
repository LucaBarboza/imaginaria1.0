import React from 'react';

// Um emblema 100% SVG contendo formas geométricas complexas, glows e um ícone fornecido (se num componente) 
// ou renderizado via SVG nativo.
const TW_COLORS = {
    amber: ['#f59e0b', '#78350f'],
    orange: ['#f97316', '#c2410c'],
    blue: ['#3b82f6', '#1e3a8a'],
    cyan: ['#06b6d4', '#164e63'],
    purple: ['#a855f7', '#3b0764'],
    indigo: ['#6366f1', '#312e81'],
    red: ['#ef4444', '#7f1d1d'],
    slate: ['#64748b', '#0f172a'],
    gray: ['#6b7280', '#111827'],
    pink: ['#ec4899', '#831843'],
    rose: ['#f43f5e', '#881337'],
    yellow: ['#eab308', '#713f12'],
    green: ['#22c55e', '#064e3b'],
    emerald: ['#10b981', '#064e3b'],
    stone: ['#78716c', '#1c1917'],
    fuchsia: ['#d946ef', '#701a75'],
    sky: ['#0ea5e9', '#0c4a6e'],
    lime: ['#84cc16', '#3f6212'],
    teal: ['#14b8a6', '#134e4a']
};

export const PremiumEmblem = ({
    type,
    colorClass = "from-pink-500 to-rose-700",
    shape = "circle",
    icon: Icon,
    emoji,
    className = "w-16 h-16"
}) => {
    // Extrai a cor base do Tailwind (ex: from-amber-700 -> amber)
    const match = colorClass.match(/from-([a-z]+)-/);
    const colorKey = match ? match[1] : 'pink';
    const [baseColor, accentColor] = TW_COLORS[colorKey] || TW_COLORS.pink;

    // IDs únicos para gradientes baseados nas cores
    const gradId = `grad_${baseColor.replace('#', '')}_${accentColor.replace('#', '')}_${shape}`;
    const glowId = `glow_${gradId}`;

    return (
        <svg viewBox="0 0 100 100" className={`drop-shadow-sm transition-transform duration-300 ${className}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={baseColor} />
                    <stop offset="100%" stopColor={accentColor} />
                </linearGradient>
                <radialGradient id={`${gradId}_glow`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={baseColor} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="0.1" />
                </radialGradient>

                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={baseColor} floodOpacity="0.5" />
                </filter>
                <filter id={`${glowId}_inner`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
                    <feFlood floodColor="#ffffff" floodOpacity="0.6" />
                    <feComposite in2="shadowDiff" operator="in" />
                    <feComposite in2="SourceGraphic" operator="over" />
                </filter>
            </defs>

            {/* Fundo radiante */}
            <circle cx="50" cy="50" r="45" fill={`url(#${gradId}_glow)`} />

            {/* Base Geométrica com Inner Shadow (Borda 3D) */}
            <g filter={`url(#${glowId}_inner)`}>
                {shape === 'circle' && (
                    <circle cx="50" cy="50" r="40" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
                )}
                {shape === 'shield' && (
                    <path d="M 50 10 L 90 20 L 90 50 C 90 80 50 95 50 95 C 50 95 10 80 10 50 L 10 20 Z" fill={`url(#${gradId})`} filter={`url(#${glowId})`} />
                )}
                {shape === 'diamond' && (
                    <path d="M 50 5 L 95 50 L 50 95 L 5 50 Z" fill={`url(#${gradId})`} filter={`url(#${glowId})`} rx="5" />
                )}
                {shape === 'hex' && (
                    <path d="M 50 5 L 85 25 L 85 75 L 50 95 L 15 75 L 15 25 Z" fill={`url(#${gradId})`} filter={`url(#${glowId})`} stroke="url(#glassRing)" strokeWidth="2" />
                )}
            </g>

            {/* Detalhes de Anéis Mágicos / Fios de Ouro Bruto */}
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

            {/* Partículas flutuantes fixas para textura premium */}
            <circle cx="30" cy="30" r="2" fill="#fff" opacity="0.8" />
            <circle cx="70" cy="40" r="1.5" fill="#fff" opacity="0.6" />
            <circle cx="45" cy="75" r="2" fill="#fff" opacity="0.5" />

            {/* Ícone Centralizado (SVG Component ou Emoji estilizado) */}
            {Icon ? (
                <g style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.5))' }}>
                    <foreignObject x="25" y="25" width="50" height="50">
                        <div xmlns="http://www.w3.org/1999/xhtml" className="w-full h-full flex items-center justify-center text-white">
                            <Icon size={28} strokeWidth={2.5} />
                        </div>
                    </foreignObject>
                </g>
            ) : emoji && (
                <text x="50" y="55" fontSize="36" textAnchor="middle" dominantBaseline="middle" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))">
                    {emoji}
                </text>
            )}

            {/* Brilho Superior Refletivo (Glassmorphism highlight) */}
            <path d="M 20 30 C 40 10, 60 10, 80 30 C 80 10, 20 10, 20 30Z" fill="#ffffff" opacity="0.3" filter="blur(2px)" />
        </svg>
    );
};
