import React from "react";
import { motion } from "framer-motion";

export default function MagicCrystal({ className = "w-6 h-6", glow = true, delay = 0 }) {
    return (
        <motion.div
            className={`relative flex items-center justify-center ${className}`}
            initial={{ y: 0 }}
            animate={{ y: [-2, 2, -2] }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
            }}
        >
            {/* Glow Effect */}
            {glow && (
                <div className="absolute inset-0 bg-emerald-400 blur-[8px] opacity-40 rounded-full" />
            )}

            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-full h-full drop-shadow-sm"
            >
                {/* Back faces */}
                <path d="M12 2L16 8L12 22L8 8L12 2Z" fill="#A7F3D0" opacity="0.5" />

                {/* Right face */}
                <path d="M12 2L18 9L12 22V2Z" fill="#34D399" />

                {/* Left face */}
                <path d="M12 2L6 9L12 22V2Z" fill="#6EE7B7" />

                {/* Front top right */}
                <path d="M12 2L16 8L12 11V2Z" fill="#10B981" />

                {/* Front top left */}
                <path d="M12 2L8 8L12 11V2Z" fill="#059669" />

                {/* Sparkles */}
                <circle cx="17" cy="6" r="1" fill="white" className="animate-pulse" />
                <circle cx="7" cy="12" r="0.5" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Inner core glow */}
                <path d="M12 5L14 9L12 16L10 9L12 5Z" fill="#ecfdf5" opacity="0.8" />
            </svg>
        </motion.div>
    );
}
