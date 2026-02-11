import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import ProductRow from "./components/ProductRow";
import CartModal from "./components/CartModal";
import WishlistModal from "./components/WishlistModal";
import CheckoutModal from "./components/CheckoutModal";
import InvoiceModal from "./components/InvoiceModal";
import ProductDetailsModal from "./components/ProductDetailsModal";
import HeroBanner from "./components/HeroBanner";
import Toast from "./components/Toast";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Footer from "./components/Footer";

// --- URLS API ---
const API_PRODUCT = "/api/products";
const API_RECO = "/api/ai";
const API_INTERACTION = "/api/interactions";

// --- CLÉ DE SESSION ---
const SESSION_KEY = "techshop_user";

export default function App() {
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    const [viewData, setViewData] = useState({ type: 'standard', content: [] });
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // États des Modales
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [loading, setLoading] = useState(true);

    // Toast state
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // --- FONCTION DE SÉCURITÉ ---
    const getUserId = (u) => {
        if (!u) return null;
        return u.id || u.user_id;
    };

    // --- CHARGEMENT INITIAL UNIFIÉ ---
    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            // 1. Récupération de la session
            let currentUser = null;
            const storedUser = localStorage.getItem(SESSION_KEY);

            if (storedUser) {
                try {
                    currentUser = JSON.parse(storedUser);
                    if (currentUser.user_id && !currentUser.id) {
                        currentUser.id = currentUser.user_id;
                    }
                    if (isMounted) {
                        setUser(currentUser);
                    }
                } catch (e) {
                    console.error("Erreur lecture session", e);
                    localStorage.removeItem(SESSION_KEY);
                }
            }

            // 2. Chargement des produits
            await fetchAllProducts();

            // 3. Chargement des données utilisateur
            const safeId = getUserId(currentUser);

            if (safeId) {
                await loadUserData(safeId).catch(e => console.error(e));
                fetchAmazonBlocks(currentUser, [], []);
            } else {
                await fetchAmazonBlocks(null, [], []);
            }

            if (isMounted) setLoading(false);
        };

        init();

        const safetyTimer = setTimeout(() => { if (isMounted) setLoading(false); }, 4000);

        return () => { isMounted = false; clearTimeout(safetyTimer); };
    }, []);

    // --- LOGIQUE DONNÉES ---
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
            const safeId = getUserId(currentUser);
            const profile = currentUser ? { age: currentUser.age, gender: currentUser.gender } : { age: 25, gender: 'Mixte' };

            const payload = {
                user_id: safeId,
                profile: profile,
                interactions: { cart: c || [], wishlist: w || [] },
                context: "home"
            };

            const response = await fetch(`${API_RECO}/get_amazon_blocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
            if (cRes.ok) setCart(await cRes.json() || []);
            if (wRes.ok) setWishlist(await wRes.json() || []);
        } catch (e) { console.error(e); }
    };

    // --- MOTEUR DE RECHERCHE & FILTRES ---
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

    // --- ACTIONS PANIER/FAVORIS ---
    const addToCart = (product) => {
        const safeId = getUserId(user);
        if (!safeId) { window.location.href = "/auth"; return; }

        const newCart = [...cart, { ...product, product_id: product.id }];
        setCart(newCart);
        showToast(`${product.name} ajouté au panier`, "cart");

        fetch(`${API_INTERACTION}/cart/${safeId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, name: product.name, price: product.price, image: product.image }) }).catch(e => console.error(e));

        if (viewData.type === 'amazon') fetchAmazonBlocks(user, newCart, wishlist);
    };

    const addToWishlist = (product) => {
        const safeId = getUserId(user);
        if (!safeId) { window.location.href = "/auth"; return; }

        if (wishlist.some(item => item.product_id === product.id)) {
            showToast("Déjà dans vos favoris", "wishlist");
            return;
        }
        const newWish = [...wishlist, { ...product, product_id: product.id }];
        setWishlist(newWish);
        showToast(`${product.name} ajouté aux favoris ❤️`, "wishlist");

        fetch(`${API_INTERACTION}/wishlist/${safeId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, name: product.name, price: product.price, image: product.image }) }).catch(e => console.error(e));

        if (viewData.type === 'amazon') fetchAmazonBlocks(user, cart, newWish);
    };

    const removeFromCart = (pid) => {
        const newCart = cart.filter(i => i.product_id !== pid);
        setCart(newCart);
        const safeId = getUserId(user);
        if (safeId) fetch(`${API_INTERACTION}/cart/${safeId}/${pid}`, { method: 'DELETE' }).catch(e => console.error(e));
    };

    const removeFromWishlist = (pid) => {
        const newWish = wishlist.filter(i => i.product_id !== pid);
        setWishlist(newWish);
        const safeId = getUserId(user);
        if (safeId) fetch(`${API_INTERACTION}/wishlist/${safeId}/${pid}`, { method: 'DELETE' }).catch(e => console.error(e));
    };

    // --- DÉTAILS PRODUIT ---
    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setDetailsOpen(true);
    };

    // --- COMMANDE ---
    const handleStartCheckout = () => {
        setCartOpen(false);
        setCheckoutOpen(true);
    };

    const handlePlaceOrder = async (deliveryInfo) => {
        const safeId = getUserId(user);
        if (safeId) {
            const total = cart.reduce((acc, item) => acc + parseFloat(item.price || 0), 0).toFixed(2);

            await fetch(`${API_INTERACTION}/orders/${safeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deliveryInfo)
            });

            const orderDetails = {
                id: Date.now().toString().slice(-6),
                date: new Date().toLocaleDateString('fr-FR'),
                total: total,
                items: cart,
                delivery: deliveryInfo
            };

            setLastOrder(orderDetails);
            setCart([]);
            setCheckoutOpen(false);
            setInvoiceOpen(true);
            showToast("Commande confirmée ! 🎉", "success");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null); setCart([]); setWishlist([]);
        window.location.reload();
    };

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price || 0), 0).toFixed(2);

    // --- LOADING ---
    if (loading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen bg-[#EAEDED] font-sans text-gray-800 flex flex-col">

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

            <main className="flex-1 max-w-[1600px] mx-auto px-4 py-6 w-full">
                {/* Hero Banner (only on home) */}
                {viewData.type === 'amazon' && (
                    <HeroBanner onSpecialFilter={handleSpecialFilter} />
                )}

                {viewData.type !== 'amazon' && (
                    <button onClick={() => fetchAmazonBlocks(user, cart, wishlist)} className="mb-4 text-blue-600 hover:underline flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour à l'accueil personnalisé
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
                            onOpenDetails={openProductDetails}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <p className="text-6xl mb-4">😔</p>
                        <p className="text-gray-500 text-xl">Aucun produit trouvé</p>
                        <button onClick={() => fetchAmazonBlocks(user, cart, wishlist)} className="mt-4 bg-[#ffd814] hover:bg-[#f7ca00] px-6 py-2 rounded-full font-medium transition-colors">
                            Retour accueil
                        </button>
                    </div>
                )}
            </main>

            <Footer />

            {/* Modals */}
            <CartModal
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                onCheckout={handleStartCheckout}
                onRemove={removeFromCart}
            />

            <CheckoutModal
                open={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                total={cartTotal}
                onSubmit={handlePlaceOrder}
            />

            <InvoiceModal
                open={invoiceOpen}
                onClose={() => setInvoiceOpen(false)}
                order={lastOrder}
            />

            <WishlistModal
                open={wishlistOpen}
                onClose={() => setWishlistOpen(false)}
                wishlist={wishlist}
                onRemove={removeFromWishlist}
                onAddToCart={addToCart}
            />

            <ProductDetailsModal
                product={selectedProduct}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                onAddToCart={addToCart}
                onBuyNow={() => setCheckoutOpen(true)}
            />

            {/* Toast notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}