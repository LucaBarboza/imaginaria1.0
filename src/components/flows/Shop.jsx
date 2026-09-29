import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import MagicCrystal from '../illustrations/MagicCrystal';
import BackButton from '../ui/BackButton';

import { useAuth } from '../../context/AuthContext';

const PriceCard = ({ price, coins, bonus, popular, onBuy }) => (
    <motion.button
        whileHover={{ y: -10 }}
        onClick={onBuy}
        className={`relative w-full h-full p-6 bg-white/80 backdrop-blur-md rounded-3xl border-2 flex flex-col justify-between items-center group overflow-hidden ${popular ? 'border-emerald-400 shadow-emerald-200 shadow-xl' : 'border-slate-100 hover:border-emerald-200'} shadow-md hover:shadow-xl transition-all text-center min-h-[320px]`}
    >
        {popular && (
            <div className="absolute top-0 w-full left-0 bg-emerald-500 text-white text-[10px] py-1.5 font-bold uppercase z-10 tracking-widest text-center">
                Melhor Valor
            </div>
        )}

        <div className={`flex flex-col items-center relative z-10 w-full flex-1 justify-center ${popular ? 'mt-4' : ''}`}>
            <span className="text-slate-400 text-sm font-medium mb-4">Pacote de</span>
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-6xl font-bold text-slate-800 font-heading leading-none">{coins}</span>
                    <MagicCrystal className="w-10 h-10" delay={0.2} />
                </div>
                <span className="text-emerald-500 font-serif italic text-xl">Cristais</span>
            </div>

            <div className="h-6">
                {bonus > 0 && (
                    <span className="text-pink-500 text-xs font-bold uppercase px-3 py-1 bg-pink-50 rounded-full">
                        +{bonus} Bônus
                    </span>
                )}
            </div>
        </div>

        <div className={`mt-auto relative z-10 w-full px-4 py-4 rounded-2xl transition-colors ${popular ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'}`}>
            <span className="font-bold text-xl">R$ {price}</span>
        </div>
    </motion.button>
);

export default function Shop({ onBack }) {
    const { addCredits, currentUser } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const packages = [
        { price: "6,00", coins: 1, bonus: 0, popular: false },
        { price: "10,00", coins: 2, bonus: 0, popular: false },
        { price: "20,00", coins: 4, bonus: 1, popular: false },
        { price: "30,00", coins: 6, bonus: 2, popular: true },
    ];

    const handleBuyIdea = async (pkg) => {
        if (!currentUser) return alert("Por favor, faça login para obter cristais.");
        if (loading) return;

        const totalCoins = pkg.coins + (pkg.bonus || 0);

        try {
            setLoading(true);
            await addCredits(totalCoins, `Compra do pacote de R$ ${pkg.price}`);
            alert(`Sucesso! Você adquiriu ${totalCoins} cristais.`);
        } catch (error) {
            console.error("Erro ao adicionar cristais:", error);
            alert("Erro ao adicionar cristais. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col p-2 relative overflow-hidden font-body text-slate-700 bg-[var(--color-bg-primary)]">
            {/* Background Blobs Animados */}
            <div className="absolute bg-blob bg-pink-200 w-[500px] h-[500px] -top-20 -left-20 z-0 opacity-50" />
            <div className="absolute bg-blob bg-emerald-100 w-[400px] h-[400px] -bottom-20 -right-20 z-0 opacity-50" style={{ animationDelay: '2s' }} />

            {/* Botão de Voltar Padrão */}
            <BackButton onClick={onBack} className="top-4 left-4 md:top-8 md:left-8" />

            <header className="w-full max-w-4xl mx-auto flex items-center justify-center z-20 mb-2 mt-2 md:mt-4">
                <div className="flex items-center gap-2 lg:gap-3">
                    <MagicCrystal className="w-6 h-6 md:w-8 md:h-8" />
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 font-heading">Loja de Cristais</h1>
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-start z-10 gap-2 mt-0 xl:-mt-2">
                <div className="text-center mb-4">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-800 mb-2">Escolha a sua Magia</h2>
                    <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed">
                        Cada história épica consome um <strong>Cristal Mágico</strong>.
                    </p>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-2 px-4">
                    {packages.map((pkg, idx) => (
                        <PriceCard
                            key={idx}
                            price={pkg.price}
                            coins={pkg.coins}
                            bonus={pkg.bonus}
                            popular={pkg.popular}
                            onBuy={() => handleBuyIdea(pkg)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
