import React, { useState, useEffect } from "react";

const slides = [
    {
        title: "Recommandations IA personnalisées",
        subtitle: "Notre intelligence artificielle analyse vos goûts pour vous proposer les meilleurs produits",
        cta: "Découvrir",
        gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
        accent: "#a78bfa",
        emoji: "🧠",
        filter: "best_sellers",
    },
    {
        title: "Ventes Flash — Jusqu'à -40%",
        subtitle: "Profitez de prix exceptionnels sur une sélection de produits populaires",
        cta: "Voir les offres",
        gradient: "from-[#b91c1c] via-[#991b1b] to-[#7f1d1d]",
        accent: "#fbbf24",
        emoji: "⚡",
        filter: "flash",
    },
    {
        title: "Livraison gratuite dès 25€",
        subtitle: "Sur 300+ produits en stock — Electronics, Home, Books, Clothing et plus",
        cta: "Explorer",
        gradient: "from-[#065f46] via-[#047857] to-[#059669]",
        accent: "#34d399",
        emoji: "🚚",
        filter: "new",
    },
];

export default function HeroBanner({ onSpecialFilter }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[current];

    return (
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl">
            {/* Background */}
            <div className={`bg-gradient-to-r ${slide.gradient} transition-all duration-1000`}>
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative px-8 py-14 md:py-20 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Text */}
                    <div className="text-white max-w-xl text-center md:text-left" key={current}>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-5 border border-white/10">
                            <span className="text-lg">{slide.emoji}</span>
                            <span style={{ color: slide.accent }}>{slide.cta}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight animate-fade-in-up">
                            {slide.title}
                        </h2>
                        <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-md">
                            {slide.subtitle}
                        </p>
                        <button
                            onClick={() => onSpecialFilter && onSpecialFilter(slide.filter)}
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 text-sm"
                            style={{ backgroundColor: slide.accent }}
                        >
                            {slide.cta}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Visual */}
                    <div className="hidden md:block">
                        <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                            <span className="text-7xl" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{slide.emoji}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`rounded-full transition-all duration-500 ${idx === current
                                ? 'w-10 h-2.5 bg-white'
                                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
