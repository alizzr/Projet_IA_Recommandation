import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductRow from "./components/ProductRow"; 
import AuthModal from "./components/AuthModal";
import CartModal from "./components/CartModal";
import WishlistModal from "./components/WishlistModal";
import ProductDetailsModal from "./components/ProductDetailsModal";

// --- URLS API ---
const API_PRODUCT     = "/api/products";      
const API_RECO        = "/api/ai";            
const API_INTERACTION = "/api/interactions";  

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // viewData = Ce qu'on affiche (Blocs Amazon OU Résultats de recherche)
  const [viewData, setViewData] = useState({ type: 'standard', content: [] }); 
  
  // allProducts = Mémoire cache de TOUS les produits pour la recherche
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT ---
  useEffect(() => {
    let isMounted = true; 
    const safetyTimer = setTimeout(() => { if (isMounted) setLoading(false); }, 1500);

    const init = async () => {
        // 1. On charge TOUS les produits en arrière-plan pour la barre de recherche
        await fetchAllProducts();

        // 2. On gère l'utilisateur
        const savedUser = localStorage.getItem("techshop_user");
        if (savedUser) {
            try {
                const u = JSON.parse(savedUser);
                if (u && u.id) {
                    if (isMounted) setUser(u);
                    await loadUserData(u.id).catch(e => console.error(e));
                    fetchAmazonBlocks(u, [], []); 
                } else { await fetchAmazonBlocks(null, [], []); }
            } catch (e) { await fetchAmazonBlocks(null, [], []); }
        } else {
            // Pas d'user ? On charge quand même les blocs Amazon génériques
            await fetchAmazonBlocks({ id: null, age: 25, gender: 'Mixte' }, [], []);
        }
        if (isMounted) setLoading(false);
    };
    init();
    return () => { isMounted = false; clearTimeout(safetyTimer); };
  }, []); 

  // --- LOGIQUE DONNÉES ---
  const fetchAllProducts = async () => {
      try {
          const res = await fetch(API_PRODUCT);
          if (res.ok) {
              const data = await res.json();
              setAllProducts(data);
              // Extraction des catégories UNIQUES
              const uniqueCats = [...new Set(data.map(p => p.category))];
              setCategories(uniqueCats);
          }
      } catch (e) { console.error(e); }
  };

  const fetchAmazonBlocks = async (currentUser, c, w) => {
      try {
          const profile = currentUser ? { age: currentUser.age, gender: currentUser.gender } : { age: 25, gender: 'Mixte' };
          const response = await fetch(`${API_RECO}/get_amazon_blocks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  user_id: currentUser ? currentUser.id : null,
                  profile: profile,
                  interactions: { cart: c || [], wishlist: w || [] },
                  context: "home" 
              })
          });
          if (response.ok) {
              const blocks = await response.json();
              if (Array.isArray(blocks) && blocks.length > 0) setViewData({ type: 'amazon', content: blocks });
          }
      } catch (e) { console.error(e); }
  };

  const loadUserData = async (userId) => {
    try {
        const [cRes, wRes] = await Promise.all([
            fetch(`${API_INTERACTION}/cart/${userId}`),
            fetch(`${API_INTERACTION}/wishlist/${userId}`)
        ]);
        if(cRes.ok) setCart(await cRes.json() || []);
        if(wRes.ok) setWishlist(await wRes.json() || []);
    } catch (e) { console.error(e); }
  };

  // --- MOTEUR DE RECHERCHE & FILTRES ---
  const handleSearch = (term) => {
      if (!term || term.trim() === "") {
          // Si recherche vide, on remet l'accueil Amazon
          fetchAmazonBlocks(user, cart, wishlist);
          return;
      }
      
      const lowerTerm = term.toLowerCase();
      const results = allProducts.filter(p => 
          p.name.toLowerCase().includes(lowerTerm) || 
          p.category.toLowerCase().includes(lowerTerm)
      );

      setViewData({
          type: 'search',
          content: [{ title: `Résultats pour "${term}" (${results.length})`, products: results }]
      });
  };

  const handleCategoryClick = (category) => {
      const results = allProducts.filter(p => p.category === category);
      setViewData({
          type: 'category',
          content: [{ title: `Rayon : ${category}`, products: results }]
      });
  };

  const handleSpecialFilter = (type) => {
      let results = [];
      let title = "";

      if (type === 'best_sellers') {
          results = [...allProducts].sort((a, b) => b.rating - a.rating).slice(0, 20);
          title = "Meilleures Ventes ⭐";
      } else if (type === 'new') {
          results = allProducts.slice(0, 10); // Simulation nouveautés
          title = "Dernières Nouveautés 🆕";
      } else if (type === 'flash') {
          results = allProducts.filter(p => p.price < 50);
          title = "Ventes Flash & Petits Prix ⚡";
      }

      setViewData({ type: 'filter', content: [{ title: title, products: results }] });
  };

  // --- ACTIONS PANIER/FAVORIS ---
  const addToCart = (product) => {
     if(!user) { setAuthOpen(true); return; }
     const newCart = [...cart, {...product, product_id: product.id}];
     setCart(newCart);
     fetch(`${API_INTERACTION}/cart/${user.id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id:product.id, name:product.name, price:product.price, image:product.image}) }).catch(e=>console.error(e));
     if(viewData.type === 'amazon') fetchAmazonBlocks(user, newCart, wishlist);
  };
  
  const addToWishlist = (product) => {
      if(!user) { setAuthOpen(true); return; }
      if (wishlist.some(item => item.product_id === product.id)) return;
      const newWish = [...wishlist, {...product, product_id: product.id}];
      setWishlist(newWish);
      fetch(`${API_INTERACTION}/wishlist/${user.id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id:product.id, name:product.name, price:product.price, image:product.image}) }).catch(e=>console.error(e));
      if(viewData.type === 'amazon') fetchAmazonBlocks(user, cart, newWish);
  };

  const removeFromCart = (pid) => {
      const newCart = cart.filter(i => i.product_id !== pid);
      setCart(newCart);
      if(user) fetch(`${API_INTERACTION}/cart/${user.id}/${pid}`, { method: 'DELETE' }).catch(e=>console.error(e));
  };
  
  const removeFromWishlist = (pid) => {
      const newWish = wishlist.filter(i => i.product_id !== pid);
      setWishlist(newWish);
      if(user) fetch(`${API_INTERACTION}/wishlist/${user.id}/${pid}`, { method: 'DELETE' }).catch(e=>console.error(e));
  };

  const handleCheckout = async () => {
      if(user) {
          await fetch(`${API_INTERACTION}/orders/${user.id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: "{}" });
          alert("Commande validée !");
          setCart([]); setCartOpen(false);
      }
  };

  const handleLoginSuccess = (response) => {
    const u = response.user || response;
    setUser(u);
    localStorage.setItem("techshop_user", JSON.stringify(u));
    loadUserData(u.id);
    fetchAmazonBlocks(u, [], []);
  };

  const handleLogout = () => {
    localStorage.removeItem("techshop_user");
    setUser(null); setCart([]); setWishlist([]);
    window.location.reload(); // Reset propre
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-xl text-[#232f3e]">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-20 font-sans text-gray-800">
      
      {/* ON PASSE LES FONCTIONS AU NAVBAR */}
      <Navbar 
        cartCount={cart.length} 
        wishlistCount={wishlist.length} 
        user={user} 
        categories={categories} // Vos VRAIES catégories
        onSearch={handleSearch} // La fonction de recherche
        onCategoryClick={handleCategoryClick}
        onSpecialFilter={handleSpecialFilter}
        onOpenCart={() => setCartOpen(true)} 
        onOpenWishlist={() => setWishlistOpen(true)} 
        onLogout={handleLogout} 
        onLogin={() => setAuthOpen(true)} 
      />
      
      <div className="h-6"></div>

      <main className="max-w-[1600px] mx-auto px-4">
        {/* BOUTON RETOUR ACCUEIL (Si on est en mode recherche) */}
        {viewData.type !== 'amazon' && (
            <button onClick={() => fetchAmazonBlocks(user, cart, wishlist)} className="mb-4 text-blue-600 hover:underline">
                ← Retour à l'accueil personnalisé
            </button>
        )}

        {viewData.content && viewData.content.length > 0 ? (
            viewData.content.map((block, idx) => (
                <ProductRow 
                    key={idx} 
                    title={block.title} 
                    products={viewData.type === 'standard' && idx === 0 ? viewData.content : block.products} 
                    onAddToCart={addToCart} 
                    onAddToWishlist={addToWishlist} 
                />
            ))
        ) : (
            <div className="text-center py-20 bg-white rounded shadow-sm">
                <p className="text-gray-500 text-xl">Aucun produit trouvé 😔</p>
                <button onClick={() => fetchAmazonBlocks(user, cart, wishlist)} className="mt-4 bg-[#ffd814] px-4 py-2 rounded">Retour accueil</button>
            </div>
        )}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onCheckout={handleCheckout} onRemove={removeFromCart} />
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} wishlist={wishlist} onRemove={removeFromWishlist} onAddToCart={addToCart} />
    </div>
  );
}