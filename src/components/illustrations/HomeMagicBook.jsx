import React from 'react';
import { motion } from 'framer-motion';

export default function HomeMagicBook({ className = "w-full h-full" }) {
    return (
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className={`relative ${className} flex items-center justify-center`}
        >
            <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="w-[120%] h-[120%] drop-shadow-2xl">
                <defs>
                    {/* Brown gradient for the exterior cover */}
                    <linearGradient id="coverBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#78350f" /> {/* Amber 900 */}
                        <stop offset="100%" stopColor="#451a03" /> {/* Amber 950 / Dark Brown */}
                    </linearGradient>

                    {/* Warm paper gradient for the pages */}
                    <linearGradient id="paperGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="paperGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>

                    {/* Edge of the paper block */}
                    <linearGradient id="paperEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>

                    <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="25" stdDeviation="20" floodColor="#280f01" floodOpacity="0.4" />
                    </filter>

                    <filter id="creaseShadow" x="-50%" y="-10%" width="200%" height="120%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                    </filter>

                    {/* Magic Glow Aura - Lavanda dos Sonhos & Warm Starlight */}
                    <radialGradient id="magicGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#9D7FEA" stopOpacity="0.8" />
                        <stop offset="45%" stopColor="#C4B5FD" stopOpacity="0.4" />
                        <stop offset="75%" stopColor="#FDE68A" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
                    </radialGradient>

                    {/* Magic Beam (Lavender & Starlight Light Rays) */}
                    <linearGradient id="magicBeam" x1="50%" y1="100%" x2="50%" y2="0%">
                        <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0" />
                        <stop offset="25%" stopColor="#9D7FEA" stopOpacity="0.45" />
                        <stop offset="70%" stopColor="#C4B5FD" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0" />
                    </linearGradient>

                    {/* Soft ambient background glow */}
                    <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* --- AMBIENT AURA (Behind everything) --- */}
                <motion.circle
                    cx="250" cy="200" r="180" fill="url(#ambientGlow)"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* --- BACK COVER --- */}
                {/* Left Cover Flap */}
                <path
                    d="M 250 280 C 250 280, 100 280, 40 230 L 70 80 C 120 120, 250 140, 250 140 Z"
                    fill="url(#coverBase)"
                    filter="url(#bookShadow)"
                />

                {/* Right Cover Flap */}
                <path
                    d="M 250 280 C 250 280, 400 280, 460 230 L 430 80 C 380 120, 250 140, 250 140 Z"
                    fill="url(#coverBase)"
                    filter="url(#bookShadow)"
                />

                {/* Cover Spine Edge (Bottom) */}
                <path
                    d="M 240 277 C 240 295, 260 295, 260 277 L 260 140 C 260 155, 240 155, 240 140 Z"
                    fill="#3f1601"
                />

                {/* --- PAGE BLOCK (THICKNESS) --- */}
                {/* Left Page Block Edge */}
                <path
                    d="M 60 215 C 110 260, 245 285, 245 285 L 245 270 C 245 270, 110 245, 60 200 Z"
                    fill="url(#paperEdge)"
                />
                {/* Right Page Block Edge */}
                <path
                    d="M 440 215 C 390 260, 255 285, 255 285 L 255 270 C 255 270, 390 245, 440 200 Z"
                    fill="url(#paperEdge)"
                />

                {/* Page Creases on the sides (showing stacked paper) */}
                <g stroke="#64748b" strokeWidth="0.5" opacity="0.3">
                    <path d="M 60 203 C 110 248, 245 273, 245 273" fill="none" />
                    <path d="M 60 206 C 110 251, 245 276, 245 276" fill="none" />
                    <path d="M 60 209 C 110 254, 245 279, 245 279" fill="none" />
                    <path d="M 60 212 C 110 257, 245 282, 245 282" fill="none" />

                    <path d="M 440 203 C 390 248, 255 273, 255 273" fill="none" />
                    <path d="M 440 206 C 390 251, 255 276, 255 276" fill="none" />
                    <path d="M 440 209 C 390 254, 255 279, 255 279" fill="none" />
                    <path d="M 440 212 C 390 257, 255 282, 255 282" fill="none" />
                </g>

                {/* --- TOP PAGES (THE SPREAD) --- */}
                {/* Left Top Page */}
                <path
                    d="M 250 295 C 230 250, 120 250, 60 200 L 90 60 C 130 50, 200 60, 250 140 Z"
                    fill="url(#paperGradLeft)"
                />
                {/* Right Top Page */}
                <path
                    d="M 250 295 C 270 250, 380 250, 440 200 L 410 60 C 370 50, 300 60, 250 140 Z"
                    fill="url(#paperGradRight)"
                />

                {/* Deep Center Crease Shadow */}
                <path
                    d="M 240 170 C 245 220, 245 235, 250 275 C 255 235, 255 220, 260 170 L 250 140 Z"
                    fill="#0f172a"
                    opacity="0.15"
                    filter="url(#creaseShadow)"
                />
                <line x1="250" y1="180" x2="250" y2="285" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />

                {/* --- LAVENDER BOOKMARK DOWN THE MIDDLE --- */}
                <path
                    d="M 250 160 C 255 220, 265 240, 260 320 L 250 310 L 240 320 C 235 240, 245 220, 250 160 Z"
                    fill="#9D7FEA"
                    filter="url(#bookShadow)"
                />
                <path
                    d="M 250 160 C 255 220, 265 240, 260 320 L 250 310 L 260 320 C 258 240, 252 220, 250 160 Z"
                    fill="#7C3AED"
                />

                {/* --- PAGE CONTENT (ABSTRACT TEXT BLOCKS) --- */}
                <g fill="#94a3b8" opacity="0.35">
                    {/* Left Page Intro */}
                    <rect x="120" y="110" width="70" height="4" rx="2" transform="rotate(18, 120, 110)" />
                    <rect x="120" y="125" width="85" height="4" rx="2" transform="rotate(18, 120, 125)" />
                    <rect x="120" y="140" width="60" height="4" rx="2" transform="rotate(18, 120, 140)" />

                    {/* Left Page Body */}
                    <rect x="120" y="170" width="90" height="4" rx="2" transform="rotate(20, 120, 170)" />
                    <rect x="120" y="185" width="80" height="4" rx="2" transform="rotate(20, 120, 185)" />
                    <rect x="120" y="200" width="85" height="4" rx="2" transform="rotate(20, 120, 200)" />

                    {/* Right Page Intro */}
                    <rect x="310" y="110" width="70" height="4" rx="2" transform="rotate(-18, 310, 110)" />
                    <rect x="295" y="125" width="85" height="4" rx="2" transform="rotate(-18, 295, 125)" />
                    <rect x="320" y="140" width="60" height="4" rx="2" transform="rotate(-18, 320, 140)" />

                    {/* Right Page Body */}
                    <rect x="290" y="170" width="90" height="4" rx="2" transform="rotate(-20, 290, 170)" />
                    <rect x="300" y="185" width="80" height="4" rx="2" transform="rotate(-20, 300, 185)" />
                    <rect x="295" y="200" width="85" height="4" rx="2" transform="rotate(-20, 295, 200)" />
                </g>

                {/* --- SUPER MAGIC EFFECTS (Harmonized Lavanda dos Sonhos) --- */}

                {/* Central Magic Glow / Aura Core */}
                <motion.ellipse
                    cx="250" cy="150" rx="140" ry="60" fill="url(#magicGlow)"
                    animate={{ scale: [0.9, 1.35, 0.9], opacity: [0.5, 0.95, 0.5] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Rays of Light (Harmonized Lavender Beams shooting up) */}
                <g className="origin-bottom transform-gpu" opacity="0.85">
                    {/* Main thick central beam */}
                    <motion.path
                        d="M 230 160 L 270 160 L 290 -80 L 210 -80 Z"
                        fill="url(#magicBeam)"
                        animate={{ opacity: [0, 0.65, 0], scaleX: [0.9, 1.2, 0.9] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Left angled intense beam */}
                    <motion.path
                        d="M 240 150 L 260 150 L 140 -100 L 100 -100 Z"
                        fill="url(#magicBeam)"
                        animate={{ opacity: [0.1, 0.7, 0.1], scaleX: [0.9, 1.2, 0.9] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    {/* Right angled intense beam */}
                    <motion.path
                        d="M 240 150 L 260 150 L 400 -100 L 360 -100 Z"
                        fill="url(#magicBeam)"
                        animate={{ opacity: [0, 0.65, 0], scaleX: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                    />
                </g>

                {/* --- Particle System (Lavender & Starlight Gold) --- */}
                <g className="transform-gpu">
                    <motion.circle cx="210" cy="120" r="3" fill="#8B5CF6" animate={{ y: [-10, -150], opacity: [0, 0.8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 0.1 }} />
                    <motion.circle cx="290" cy="180" r="2.5" fill="#FBBF24" animate={{ y: [0, -160], opacity: [0, 0.7, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.2 }} />
                    <motion.circle cx="280" cy="110" r="5" fill="#9D7FEA" animate={{ y: [0, -170], opacity: [0, 0.6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: 0.6 }} />
                    <motion.circle cx="220" cy="190" r="3.5" fill="#C4B5FD" animate={{ y: [-5, -140], opacity: [0, 0.7, 0] }} transition={{ duration: 3.9, repeat: Infinity, ease: "linear", delay: 2.3 }} />
                    <motion.circle cx="260" cy="130" r="2" fill="#FDE68A" animate={{ y: [0, -180], opacity: [0, 0.9, 0] }} transition={{ duration: 3.3, repeat: Infinity, ease: "linear", delay: 1.8 }} />
                    <motion.circle cx="240" cy="170" r="4" fill="#7C3AED" animate={{ y: [-15, -155], opacity: [0, 0.6, 0] }} transition={{ duration: 4.1, repeat: Infinity, ease: "linear", delay: 0.4 }} />
                </g>

                {/* --- Sparkles (Lavender & Golden Stars) --- */}
                <g className="transform-gpu">
                    <motion.path d="M 250 80 L 253 65 L 268 62 L 253 59 L 250 44 L 247 59 L 232 62 L 247 65 Z" fill="#FDE68A" animate={{ y: [0, -100], opacity: [0, 0.8, 0], scale: [0.5, 1, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "linear", delay: 0.3 }} />
                    <motion.path d="M 210 110 L 212 98 L 224 96 L 212 94 L 210 82 L 208 94 L 196 96 L 208 98 Z" fill="#C4B5FD" animate={{ y: [0, -90], opacity: [0, 0.7, 0], scale: [0.5, 1, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "linear", delay: 1.5 }} />
                    <motion.path d="M 290 120 L 291 113 L 298 112 L 291 111 L 290 104 L 289 111 L 282 112 L 289 113 Z" fill="#9D7FEA" animate={{ y: [0, -80], opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.8 }} />
                    <motion.path d="M 230 160 L 232 150 L 242 148 L 232 146 L 230 136 L 228 146 L 218 148 L 228 150 Z" fill="#FBBF24" animate={{ y: [0, -120], opacity: [0, 0.7, 0], scale: [0.5, 1.2, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "linear", delay: 2.2 }} />
                </g>
            </svg>
        </motion.div>
    );
}
