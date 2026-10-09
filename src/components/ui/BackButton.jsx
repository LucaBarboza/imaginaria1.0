import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const BackButton = ({ onClick, label = "Voltar", className = "" }) => {

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <div className={`fixed top-4 left-4 sm:top-5 sm:left-5 z-50 pointer-events-auto ${className}`}>
            <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-md hover:shadow-lg transition-all group cursor-pointer text-slate-700 hover:text-magic-pink active:scale-95"
            >
                <ChevronLeft size={18} className="text-magic-pink group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold font-heading text-slate-700 group-hover:text-magic-pink transition-colors">
                    {label}
                </span>
            </motion.button>
        </div>
    );
};

export default BackButton;
