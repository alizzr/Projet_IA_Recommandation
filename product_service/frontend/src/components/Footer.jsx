import React from "react";

export default function Footer() {
    return (
        <>
            {/* Back to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full bg-[#37475a] hover:bg-[#485769] text-white text-sm py-3 transition-colors"
            >
                Retour en haut ↑
            </button>

            {/* Main Footer */}
            <footer className="bg-[#232f3e] text-gray-300">
                <div className="max-w-[1600px] mx-auto px-8 py-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Pour mieux nous connaître</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-white hover:underline cursor-pointer">À propos</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Carrières</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Développement durable</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Nos services</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-white hover:underline cursor-pointer">Livraison gratuite</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Recommandations IA</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Retours simplifiés</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Besoin d'aide ?</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-white hover:underline cursor-pointer">FAQ</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Contact</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Suivi de commande</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-3 text-sm">Projet IA</h4>
                            <ul className="space-y-2 text-xs">
                                <li className="hover:text-white hover:underline cursor-pointer">XGBoost Recommandation</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Architecture Microservices</li>
                                <li className="hover:text-white hover:underline cursor-pointer">Documentation API</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-700">
                    <div className="max-w-[1600px] mx-auto px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">Tech<span className="text-[#febd69]">Shop</span></span>
                            <span>— Projet IA Recommandation</span>
                        </div>
                        <span>© 2026 TechShop • Propulsé par XGBoost & React</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
