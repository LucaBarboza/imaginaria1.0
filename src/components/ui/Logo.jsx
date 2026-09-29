import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Logo() {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
            {/* Ambient Glow */}
            <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-full blur-3xl"
            />

            <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
            >
                {/* Book Icon */}
                <div className="relative">
                    <BookOpen
                        size={80}
                        className="text-slate-100 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        strokeWidth={1}
                    />

                    {/* Magical Energy - Center */}
                    <motion.div
                        animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full"
                    />

                    {/* Floating Particles */}
                    <motion.div
                        animate={{ y: [-10, -25, -10], x: [0, 5, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-4 -right-4 text-yellow-300"
                    >
                        <Sparkles size={24} className="drop-shadow-lg" />
                    </motion.div>

                    <motion.div
                        animate={{ y: [-5, -20, -5], x: [0, -5, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
                        className="absolute -top-2 -left-4 text-pink-300"
                    >
                        <Sparkles size={16} className="drop-shadow-lg" />
                    </motion.div>

                    {/* Bottom Glow */}
                    <motion.div
                        animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-purple-500/50 blur-lg rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
}
