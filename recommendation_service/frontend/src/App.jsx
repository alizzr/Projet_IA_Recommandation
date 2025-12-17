import React, { useState } from "react";
import IAFormModal from "./components/IAFormModal";
import ProductCard from "./components/ProductCard"; // ou RecommendationCard
import { requestRecommendations, postCart } from "./api";

export default function App() {
  const [iaOpen, setIaOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleIASubmit = async (formData) => {
    setLoading(true);
    setIaOpen(false); // On ferme la modale pendant le chargement
    try {
      const results = await requestRecommendations(formData);
      setRecommendations(results);
      setHasSearched(true);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la communication avec le cerveau IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    // On récupère l'utilisateur connecté via le localStorage (partagé par le domaine)
    const savedUser = localStorage.getItem("techshop_user");
    if (!savedUser) {
        if(window.confirm("Vous devez être connecté pour ajouter au panier. Aller à la connexion ?")) {
            window.location.href = "/account";
        }
        return;
    }
    const user = JSON.parse(savedUser);
    
    try {
        await postCart(user.id, product);
        alert(`✅ ${product.name} ajouté au panier !`);
    } catch(e) { 
        alert("Erreur lors de l'ajout au panier."); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white font-sans">
      
      {/* Navbar Simple */}
      <nav className="p-6 flex justify-between items-center backdrop-blur-sm bg-black/10">
        <div className="text-2xl font-bold flex items-center gap-2">
           🧠 TechShop Advisor
        </div>
        <a href="/" className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/20 transition decoration-none text-white no-underline">
           🔙 Retour Magasin
        </a>
      </nav>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* État initial : Accueil */}
        {!hasSearched && !loading && (
          <div className="text-center max-w-2xl mt-10">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Trouvez votre produit idéal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                grâce à l'IA
              </span>
            </h1>
            <p className="text-xl text-indigo-100 mb-10">
              Répondez à quelques questions simples. Notre algorithme analyse vos besoins pour vous proposer les meilleurs choix.
            </p>
            <button 
              onClick={() => setIaOpen(true)}
              className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform"
            >
              ✨ Commencer l'analyse
            </button>
          </div>
        )}

        {/* État de chargement */}
        {loading && (
          <div className="text-center mt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold animate-pulse">L'IA réfléchit...</h2>
            <p className="text-indigo-200">Comparaison de 100+ produits en cours</p>
          </div>
        )}

        {/* État Résultats */}
        {hasSearched && !loading && (
          <div className="w-full">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
               <div>
                 <h2 className="text-3xl font-bold">🎯 Recommandations</h2>
                 <p className="text-indigo-200">Voici les produits les plus pertinents pour vous.</p>
               </div>
               <button 
                 onClick={() => setIaOpen(true)} 
                 className="text-pink-300 hover:text-white underline"
               >
                 Modifier mes critères
               </button>
            </div>

            {recommendations.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-2xl">
                    <p className="text-xl">Aucun produit ne correspond exactement à 100%.</p>
                    <button onClick={() => setIaOpen(true)} className="mt-4 text-pink-400">Réessayer</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendations.map((p) => (
                    // On peut réutiliser ProductCard mais il faut gérer le style CSS qui attend souvent un fond blanc
                    // Pour faire simple, on l'encapsule dans une div blanche
                    <div key={p.product_id} className="bg-white rounded-2xl overflow-hidden shadow-lg text-gray-800">
                        <ProductCard product={p} onClick={() => {}} /> 
                        <button 
                            onClick={() => handleAddToCart(p)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                        >
                            Ajouter au panier 🛒
                        </button>
                    </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </main>

      {/* Le Formulaire (Modale) */}
      <IAFormModal 
        open={iaOpen} 
        onClose={() => setIaOpen(false)} 
        onSubmit={handleIASubmit} 
      />
      
    </div>
  );
}