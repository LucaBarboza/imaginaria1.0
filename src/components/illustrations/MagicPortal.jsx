import React from 'react';
import { motion } from 'framer-motion';

export default function MagicPortal({ className = "w-full h-full" }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-magic-pink/40 via-purple-500/20 to-magic-emerald/40 blur-3xl rounded-full" />

            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-2xl">
                <defs>
                    <linearGradient id="portalVoid" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0B0F19" />
                        <stop offset="40%" stopColor="#1e0b2b" />
                        <stop offset="80%" stopColor="#3b0944" />
                        <stop offset="100%" stopColor="#065f57" />
                    </linearGradient>

                    <linearGradient id="portalArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#92400e" />
                        <stop offset="25%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#fef3c7" />
                        <stop offset="75%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#92400e" />
                    </linearGradient>

                    <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.6" />
                        <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </radialGradient>

                    <linearGradient id="magicSparks" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbcfe8" />
                        <stop offset="50%" stopColor="#f0abfc" />
                        <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>

                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <filter id="arcShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
                    </filter>
                </defs>

                {/* Brilho de Fundo Pulsante */}
                <circle cx="100" cy="100" r="95" fill="url(#portalGlow)" className="animate-pulse" style={{ animationDuration: '4s' }} />

                {/* Fundo escuro do poço */}
                <path d="M 40 160 C 40 80, 45 35, 100 35 C 155 35, 160 80, 160 160 Z" fill="#000" filter="url(#arcShadow)" opacity="0.4" />

                {/* Arco Exterior */}
                <path d="M 32 180 L 168 180 L 163 160 C 163 75, 158 20, 100 20 C 42 20, 37 75, 37 160 Z" fill="url(#portalArcGrad)" />

                {/* Recorte Frontal Exterior (Pedra Escura) */}
                <path d="M 40 160 C 40 80, 45 30, 100 30 C 155 30, 160 80, 160 160 Z" fill="#451a03" />

                {/* Arco Interno */}
                <path d="M 45 160 C 45 82, 50 35, 100 35 C 150 35, 155 82, 155 160 Z" fill="url(#portalArcGrad)" />

                {/* Interior Vazio / Portal Mágico */}
                <path d="M 50 160 C 50 85, 53 45, 100 45 C 147 45, 150 85, 150 160 Z" fill="url(#portalVoid)" />

                {/* Espirais de Magia Internas (Animadas) */}
                <g className="origin-center animate-spin" style={{ animationDuration: '20s', animationTimingFunction: 'linear' }}>
                    <path d="M 100 50 C 140 50, 140 150, 100 150 C 60 150, 60 50, 100 50" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.6" filter="url(#glow)" strokeDasharray="20 10" className="animate-pulse" />
                    <path d="M 55 100 C 55 140, 145 140, 145 100 C 145 60, 55 60, 55 100" fill="none" stroke="#34d399" strokeWidth="2" opacity="0.6" filter="url(#glow)" strokeDasharray="30 15" className="animate-pulse" style={{ animationDelay: '1s' }} />
                </g>

                {/* Redemoinho central profundo */}
                <path d="M 100 80 C 120 80, 120 120, 100 120 C 80 120, 80 80, 100 80" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.8" filter="url(#intenseGlow)" className="animate-ping origin-center scale-150" style={{ animationDuration: '4s' }} />

                {/* Ranhuras/Runas do Arco Mágico */}
                <path d="M 60 40 L 65 50 L 55 55 Z" fill="#fde68a" opacity="0.8" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '2s' }} />
                <path d="M 100 25 L 105 35 L 95 35 Z" fill="#fbcfe8" opacity="0.9" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                <path d="M 140 40 L 145 55 L 135 50 Z" fill="#6ee7b7" opacity="0.8" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
                <path d="M 45 90 L 55 95 L 45 100 Z" fill="#a78bfa" opacity="0.9" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
                <path d="M 155 90 L 145 95 L 155 100 Z" fill="#a78bfa" opacity="0.9" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />

                {/* Joias base do arco */}
                <circle cx="48" cy="140" r="4" fill="#10b981" filter="url(#intenseGlow)" />
                <circle cx="152" cy="140" r="4" fill="#ec4899" filter="url(#intenseGlow)" />

                {/* Linhas de divisão na base */}
                <path d="M 22 180 L 178 180 L 168 190 L 32 190 Z" fill="url(#portalArcGrad)" />
                <line x1="28" y1="180" x2="172" y2="180" stroke="#fef3c7" strokeWidth="1" opacity="0.7" />
                <path d="M 15 190 L 185 190 L 180 196 L 20 196 Z" fill="#78350f" />

                {/* Poeira Estelar Flutuante Saindo do Portal */}
                <g className="origin-center">
                    <circle cx="100" cy="100" r="1.5" fill="#fff" className="animate-ping" style={{ animationDuration: '2s' }} />
                    <circle cx="85" cy="80" r="1.5" fill="#fbcfe8" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                    <circle cx="115" cy="130" r="1.5" fill="#6ee7b7" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
                    <circle cx="70" cy="120" r="2" fill="#fef08a" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
                    <circle cx="125" cy="65" r="2" fill="#c084fc" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
                </g>

                {/* Estrelas desenhadas que flutuam em Y */}
                <g className="animate-bounce" style={{ animationDuration: '4s' }}>
                    <path d="M 90 70 L 92 78 L 100 80 L 92 82 L 90 90 L 88 82 L 80 80 L 88 78 Z" fill="#fff" filter="url(#intenseGlow)" opacity="0.9" />
                </g>
                <g className="animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                    <path d="M 120 110 L 121 115 L 126 116 L 121 117 L 120 122 L 119 117 L 114 116 L 119 115 Z" fill="#fef3c7" filter="url(#glow)" opacity="0.8" />
                </g>
                <g className="animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>
                    <path d="M 75 130 L 76 133 L 79 134 L 76 135 L 75 138 L 74 135 L 71 134 L 74 133 Z" fill="#a7f3d0" filter="url(#glow)" opacity="0.8" />
                </g>
            </svg>
        </div>
    );
}
