import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import { fetchProducts, postCart, getCart, getWishlist, postWishlist, deleteFromWishlist } from "./api";
import WishlistModal from "./components/WishlistModal";

export default function App() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [user, setUser] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [priceMax, setPriceMax] = useState(5000);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("techshop_user");
    let currentUser = null;
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            // Vérification de sécurité
            if (currentUser && currentUser.id) {
                setUser(currentUser);
            }
        } catch (e) { console.error("Erreur parsing user", e); }
    }
    
    loadProducts();

    if (currentUser && currentUser.id) {
        getCart(currentUser.id).then(items => setCartCount(items.length));
        getWishlist(currentUser.id).then(items => setWishlist(items));
    } else {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartCount(localCart.length);
        setWishlist(JSON.parse(localStorage.getItem("wishlist")) || []);
    }
  }, []);

  // Filtrage par catégorie
  useEffect(() => {
    let filtered = allProducts;
    if (selectedCategory !== "Toutes") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setProducts(filtered);
  }, [selectedCategory, allProducts]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
      setAllProducts(data);
    } catch (e) { console.error(e); }
  };

  const getProductId = (product) => product.id || product._id || product.product_id;

  const toggleWishlist = async (product) => {
    const pid = getProductId(product);
    const exists = wishlist.some(p => getProductId(p) === pid);
    let newWishlist;
    if (exists) {
        newWishlist = wishlist.filter(p => getProductId(p) !== pid);
    } else {
        newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);

    if (user && user.id) {
        if (exists) await deleteFromWishlist(user.id, pid);
        else await postWishlist(user.id, product);
    } else {
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    }
  };

  // --- CORRECTION PRINCIPALE ICI ---
  const handleAddToCart = async (product) => {
    console.log("Tentative ajout panier :", product);

    // 1. Si connecté -> Envoi vers Base de Données
    if (user && user.id) {
        try {
            await postCart(user.id, product); 
            // On incrémente SEULEMENT si l'appel API a réussi
            setCartCount(prev => prev + 1);
            alert("Produit ajouté à votre compte !"); 
        } catch (e) {
            console.error("Erreur ajout panier :", e);
            alert("Erreur : Impossible d'ajouter au panier. Vérifiez que vous êtes bien connecté.");
        }
    } 
    // 2. Si Invité -> LocalStorage
    else {
        const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
        const nextCart = [...currentCart, product];
        localStorage.setItem("cart", JSON.stringify(nextCart));
        setCartCount(prev => prev + 1);
        
        if(window.confirm("Produit ajouté en local. Connectez-vous pour le sauvegarder !")) {
             window.location.href="/account";
        }
    }
  };

  const handleSearch = (q) => {
    if(!q) return setProducts(allProducts);
    setProducts(allProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase())));
  };

  const categories = ["Toutes", ...new Set(allProducts.map(p => p.category))];

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Navbar 
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        user={user}
        onOpenCart={() => window.location.href = "/account"}
        onOpenWishlist={() => setWishlistOpen(true)}
        onSearch={handleSearch}
        onLogout={() => { localStorage.removeItem("techshop_user"); window.location.reload(); }}
      />
      <div className="container mx-auto px-4 py-6 flex gap-8">
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Catégories</h3>
                <ul className="space-y-2">{categories.map(cat => <li key={cat} className="cursor-pointer hover:text-yellow-600" onClick={() => setSelectedCategory(cat)}>{cat}</li>)}</ul>
                <hr className="my-4"/>
                <h3 className="font-bold text-lg mb-2">Prix Max: {priceMax}€</h3>
                <input type="range" min="0" max="5000" step="100" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-yellow-500" />
            </div>
        </aside>
        <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p, i) => (
                    <ProductCard key={getProductId(p) || i} product={p} onAddToCart={() => handleAddToCart(p)} onViewDetails={() => { setSelectedProduct(p); setProductDetailsOpen(true); }} onAddToWishlist={() => toggleWishlist(p)} isInWishlist={wishlist.some(w => getProductId(w) === getProductId(p))} />
                ))}
            </div>
        </main>
      </div>
      <ProductDetailsModal open={productDetailsOpen} product={selectedProduct} onClose={() => setProductDetailsOpen(false)} onAddToCart={() => handleAddToCart(selectedProduct)} />
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} wishlist={wishlist} onRemove={(id) => toggleWishlist({id: id})} onAddToCart={handleAddToCart} />
    </div>
  );
}