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
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`absolute top-6 left-6 z-50 flex items-center gap-2 transition-all group ${className}`}
        >
            <ChevronLeft size={20} className="text-magic-pink group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold text-slate-600 group-hover:text-magic-pink transition-colors">
                {label}
            </span>
        </motion.button>
    );
};

export default BackButton;
