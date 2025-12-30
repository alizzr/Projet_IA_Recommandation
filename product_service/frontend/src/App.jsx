import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductRow from "./components/ProductRow"; 
import CartModal from "./components/CartModal";
import WishlistModal from "./components/WishlistModal";
// NOUVEAUX IMPORTS POUR LE FLUX DE COMMANDE
import CheckoutModal from "./components/CheckoutModal";
import InvoiceModal from "./components/InvoiceModal";

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

  // États des Modales
  // (AuthModal supprimé car on redirige vers /auth)
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  
  // NOUVEAUX ÉTATS POUR LA COMMANDE
  const [checkoutOpen, setCheckoutOpen] = useState(false); // Saisie adresse
  const [invoiceOpen, setInvoiceOpen] = useState(false);   // Ticket de caisse
  const [lastOrder, setLastOrder] = useState(null);        // Données facture
  
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT (Identique à ton code) ---
  useEffect(() => {
    let isMounted = true; 
    const safetyTimer = setTimeout(() => { if (isMounted) setLoading(false); }, 1500);

    const init = async () => {
        // 1. On charge TOUS les produits
        await fetchAllProducts();

        // 2. On gère l'utilisateur (Clé corrigée: techshop_user)
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
            // Pas d'user ? Blocs génériques
            await fetchAmazonBlocks({ id: null, age: 25, gender: 'Mixte' }, [], []);
        }
        if (isMounted) setLoading(false);
    };
    init();
    return () => { isMounted = false; clearTimeout(safetyTimer); };
  }, []); 

  // --- LOGIQUE DONNÉES (Identique à ton code) ---
  const fetchAllProducts = async () => {
      try {
          const res = await fetch(API_PRODUCT);
          if (res.ok) {
              const data = await res.json();
              setAllProducts(data);
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

  // --- MOTEUR DE RECHERCHE & FILTRES (Identique à ton code) ---
  const handleSearch = (term) => {
      if (!term || term.trim() === "") {
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
          results = allProducts.slice(0, 10); 
          title = "Dernières Nouveautés 🆕";
      } else if (type === 'flash') {
          results = allProducts.filter(p => p.price < 50);
          title = "Ventes Flash & Petits Prix ⚡";
      }
      setViewData({ type: 'filter', content: [{ title: title, products: results }] });
  };

  // --- ACTIONS PANIER/FAVORIS (MODIFIÉ POUR REDIRECTION) ---
  const addToCart = (product) => {
     // SI PAS CONNECTÉ -> REDIRECTION /AUTH
     if(!user) { window.location.href = "/auth"; return; }
     
     const newCart = [...cart, {...product, product_id: product.id}];
     setCart(newCart);
     fetch(`${API_INTERACTION}/cart/${user.id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id:product.id, name:product.name, price:product.price, image:product.image}) }).catch(e=>console.error(e));
     if(viewData.type === 'amazon') fetchAmazonBlocks(user, newCart, wishlist);
  };
  
  const addToWishlist = (product) => {
      // SI PAS CONNECTÉ -> REDIRECTION /AUTH
      if(!user) { window.location.href = "/auth"; return; }
      
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

  // --- NOUVEAU FLUX DE COMMANDE (Checkout -> Invoice) ---
  
  // 1. Déclenché par "Commander" dans le Panier
  const handleStartCheckout = () => {
      setCartOpen(false);      // Ferme le panier
      setCheckoutOpen(true);   // Ouvre le formulaire d'adresse
  };

  // 2. Déclenché quand le formulaire Adresse est validé
  const handlePlaceOrder = async (deliveryInfo) => {
      if(user) {
          const total = cart.reduce((acc, item) => acc + parseFloat(item.price || 0), 0).toFixed(2);
          
          // Envoi au backend
          await fetch(`${API_INTERACTION}/orders/${user.id}`, { 
              method: 'POST', 
              headers: {'Content-Type':'application/json'}, 
              body: JSON.stringify(deliveryInfo) 
          });

          // Création de la facture locale pour affichage immédiat
          const orderDetails = {
              id: Date.now().toString().slice(-6),
              date: new Date().toLocaleDateString('fr-FR'),
              total: total,
              items: cart,
              delivery: deliveryInfo
          };

          setLastOrder(orderDetails); // Stocke pour la facture
          setCart([]);                // Vide le panier
          setCheckoutOpen(false);     // Ferme le checkout
          setInvoiceOpen(true);       // Ouvre la facture 🎉
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("techshop_user");
    setUser(null); setCart([]); setWishlist([]);
    window.location.reload(); 
  };

  // Calcul du total pour le passer au CheckoutModal
  const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price || 0), 0).toFixed(2);

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-xl text-[#232f3e]">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-20 font-sans text-gray-800">
      
      <Navbar 
        cartCount={cart.length} 
        wishlistCount={wishlist.length} 
        user={user} 
        categories={categories} 
        onSearch={handleSearch} 
        onCategoryClick={handleCategoryClick}
        onSpecialFilter={handleSpecialFilter}
        onOpenCart={() => setCartOpen(true)} 
        onOpenWishlist={() => setWishlistOpen(true)} 
        onLogout={handleLogout} 
        onLogin={() => window.location.href = "/auth"} 
      />
      
      <div className="h-6"></div>

      <main className="max-w-[1600px] mx-auto px-4">
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

      {/* --- GESTION DES MODALES --- */}
      
      {/* 1. Panier (Action "Commander" ouvre le Checkout) */}
      <CartModal 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cart={cart} 
        onCheckout={handleStartCheckout} 
        onRemove={removeFromCart} 
      />
      
      {/* 2. Saisie Adresse (Action "Valider" ouvre la Facture) */}
      <CheckoutModal 
          open={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          total={cartTotal}
          onSubmit={handlePlaceOrder} 
      />

      {/* 3. Facture Finale */}
      <InvoiceModal 
          open={invoiceOpen} 
          onClose={() => setInvoiceOpen(false)} 
          order={lastOrder} 
      />

      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} wishlist={wishlist} onRemove={removeFromWishlist} onAddToCart={addToCart} />
    </div>
  );
}