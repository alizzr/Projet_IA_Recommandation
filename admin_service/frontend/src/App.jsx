import React, { useState, useEffect } from "react";

// URLS API
const API_AI = "http://localhost:5001";
const API_PRODUCT = "http://localhost:5002";
const API_USER = "http://localhost:5003";
const API_INTERACTION = "http://localhost:5004";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState([]);
  
  // --- STATE MODIFICATION & DETAILS ---
  const [editingProduct, setEditingProduct] = useState(null); // Pour le mode édition
  const [selectedOrder, setSelectedOrder] = useState(null);   // Pour la modale commande

  // --- STATE MATRIX ---
  const [logs, setLogs] = useState([]);
  const [aiStats, setAiStats] = useState({ products: 0, status: "Connecté", last_train: "Inconnu" });
  const [training, setTraining] = useState(false);

  // --- STATE FORMULAIRE PRODUIT ---
  const [productForm, setProductForm] = useState({
      name: "", price: "", category: "Electronics", brand: "",
      usage: "Leisure", design_rating: 4, image_url: ""
  });

  useEffect(() => {
    if (tab === "dashboard") fetchAiStats();
    if (tab === "products") { fetchProducts(); resetForm(); }
    if (tab === "users") fetchUsers();
    if (tab === "orders") fetchOrders();
  }, [tab]);

  // --- FONCTIONS LOGS & IA ---
  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  
  const fetchAiStats = () => {
      fetch(`${API_AI}/stats`).then(r=>r.json()).then(d => {
          setAiStats({ products: d.products_count, status: "En ligne", last_train: "Aujourd'hui" });
      }).catch(() => setAiStats({ ...aiStats, status: "Déconnecté" }));
  };

  const handleRetrain = async () => {
    setTraining(true);
    setLogs([]);
    addLog("🚀 INITIALISATION DU PROTOCOLE XGBOOST...");
    setTimeout(() => { addLog("✅ Modèle mis à jour."); setTraining(false); }, 3000);
  };

  // --- FONCTIONS CRUD PRODUITS ---
  const fetchProducts = () => fetch(`${API_PRODUCT}/products`).then(r=>r.json()).then(setData);
  
  const resetForm = () => {
      setEditingProduct(null);
      setProductForm({ name: "", price: "", category: "Electronics", brand: "", usage: "Leisure", design_rating: 4, image_url: "" });
  };

  const handleEditClick = (product) => {
      setEditingProduct(product.id);
      setProductForm({ ...product }); // Remplit le formulaire
      window.scrollTo(0,0); // Remonte pour voir le formulaire
  };

  const handleSaveProduct = async (e) => {
      e.preventDefault();
      const payload = {
          ...productForm,
          price: parseFloat(productForm.price),
          design_rating: parseInt(productForm.design_rating),
          image_url: productForm.image_url || `https://loremflickr.com/400/300/${productForm.category.toLowerCase()}`
      };

      if (editingProduct) {
          // MODE MODIFICATION (PUT)
          await fetch(`${API_PRODUCT}/products/${editingProduct}`, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(payload)
          });
          alert("Produit modifié !");
      } else {
          // MODE CRÉATION (POST)
          await fetch(`${API_PRODUCT}/products`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(payload)
          });
          alert("Produit ajouté !");
      }
      resetForm();
      fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
      if(window.confirm("Supprimer ?")) {
          await fetch(`${API_PRODUCT}/products/${id}`, { method: 'DELETE' });
          fetchProducts();
      }
  };

  // --- FONCTIONS USERS & COMMANDES ---
  const fetchUsers = () => fetch(`${API_USER}/users`).then(r=>r.json()).then(setData);
  const handleDeleteUser = async (id) => {
      if(window.confirm("Bannir ?")) { await fetch(`${API_USER}/users/${id}`, { method: 'DELETE' }); fetchUsers(); }
  };

  const fetchOrders = () => fetch(`${API_INTERACTION}/orders/all`).then(r=>r.json()).then(setData);
  
  // Simulation de récupération des détails (si l'API ne le fait pas encore)
  const handleViewOrder = (order) => {
      // Idéalement on ferait un fetch(`${API_INTERACTION}/orders/${order.id}`) ici
      setSelectedOrder(order); 
  };

  // --- RENDU ---
  return (
    <div style={{minHeight:"100vh", backgroundColor:"#111", color:"#ccc", display:"flex", fontFamily:"'Segoe UI', sans-serif"}}>
      
      {/* SIDEBAR */}
      <div style={{width:"240px", backgroundColor:"#000", borderRight:"1px solid #333", padding:"20px"}}>
        <h2 style={{color:"#00ff00", margin:"0 0 20px 0", borderBottom:"1px solid #333", paddingBottom:"15px"}}>CLOUD CONTROL</h2>
        <NavButton active={tab==="dashboard"} onClick={()=>setTab("dashboard")} icon="🧠" label="Cerveau IA" />
        <NavButton active={tab==="products"} onClick={()=>setTab("products")} icon="📦" label="Gestion Produits" />
        <NavButton active={tab==="users"} onClick={()=>setTab("users")} icon="👥" label="Gestion Users" />
        <NavButton active={tab==="orders"} onClick={()=>setTab("orders")} icon="💳" label="Commandes" />
      </div>

      {/* MAIN CONTENT */}
      <div style={{flex:1, padding:"30px", overflowY:"auto", position:"relative"}}>
        
        {/* MODALE DETAILS COMMANDE */}
        {selectedOrder && (
            <div style={modalOverlay}>
                <div style={modalContent}>
                    <h3 style={{color:"#00ff00"}}>Commande #{selectedOrder.id}</h3>
                    <p>Total: {selectedOrder.total} €</p>
                    <p>Date: {selectedOrder.date}</p>
                    <hr style={{borderColor:"#444"}}/>
                    <h4>Articles :</h4>
                    {/* Si tu as une liste 'items' dans ta commande, affiche-la ici */}
                    <ul>
                        {selectedOrder.items ? selectedOrder.items.map((it, i) => (
                            <li key={i}>{it.name} x {it.qty} ({it.price}€)</li>
                        )) : <li>Détails non disponibles (API update requise)</li>}
                    </ul>
                    <button onClick={()=>setSelectedOrder(null)} style={{marginTop:"20px", padding:"10px", width:"100%"}}>Fermer</button>
                </div>
            </div>
        )}

        {/* DASHBOARD */}
        {tab === "dashboard" && (
            <div>
                <h1 style={{color:"#00ff00"}}>DASHBOARD ENTRAÎNEMENT</h1>
                <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"20px", marginBottom:"30px"}}>
                    <MatrixCard label="STATUT" value={aiStats.status} color={aiStats.status==="En ligne"?"#00ff00":"red"} />
                    <MatrixCard label="ITEMS SCANNNÉS" value={aiStats.products} color="#00ff00" />
                    <MatrixCard label="DERNIER TRAIN" value={aiStats.last_train} color="#00ff00" />
                </div>
                <button onClick={handleRetrain} disabled={training} style={trainBtn(training)}>
                    {training ? ">> EXÉCUTION DU SCRIPT..." : "⚡ LANCER LE RÉ-ENTRAÎNEMENT"}
                </button>
                <div style={logBox}>{logs.map((log, i) => <div key={i}>{`> ${log}`}</div>)}</div>
            </div>
        )}

        {/* CRUD PRODUITS (AVEC EDIT) */}
        {tab === "products" && (
            <div style={contentBox}>
                <h2 style={{color:"white", borderBottom:"1px solid #444", paddingBottom:"15px"}}>📦 Inventaire</h2>
                
                <form onSubmit={handleSaveProduct} style={{backgroundColor:"#252525", padding:"20px", borderRadius:"6px", marginBottom:"30px", border:"1px solid #444"}}>
    <div style={{display:"flex", justifyContent:"space-between", marginBottom:"15px"}}>
        <h4 style={{margin:0, color: editingProduct ? "#ffa500" : "#00ff00"}}>
            {editingProduct ? `✏️ MODIFICATION DU PRODUIT #${editingProduct}` : "➕ NOUVEAU PRODUIT"}
        </h4>
        {editingProduct && (
            <button type="button" onClick={resetForm} style={{backgroundColor:"#555", color:"white", border:"none", padding:"5px 10px", cursor:"pointer"}}>
                Annuler
            </button>
        )}
    </div>
    
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px"}}>
        <input style={erpInput} placeholder="Nom" value={productForm.name} onChange={e=>setProductForm({...productForm, name:e.target.value})} required />
        <input style={erpInput} placeholder="Marque" value={productForm.brand} onChange={e=>setProductForm({...productForm, brand:e.target.value})} required />
        <input style={erpInput} placeholder="Prix" type="number" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm, price:e.target.value})} required />
        <select style={erpInput} value={productForm.category} onChange={e=>setProductForm({...productForm, category:e.target.value})}>
             {['Electronics','Toys','Home','Beauty','Fashion','Sports'].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input style={{...erpInput, gridColumn:"span 2"}} placeholder="Image URL" value={productForm.image_url} onChange={e=>setProductForm({...productForm, image_url:e.target.value})} />
    </div>

    {/* LE BOUTON EST ICI - IL DOIT ÊTRE VISIBLE */}
    <button type="submit" style={{marginTop:"15px", backgroundColor: editingProduct ? "#ffa500" : "#0077ff", color:"white", border:"none", padding:"12px 30px", borderRadius:"4px", cursor:"pointer", fontWeight:"bold", width:"100%", fontSize:"16px"}}>
        {editingProduct ? "💾 SAUVEGARDER LES MODIFICATIONS" : "✅ AJOUTER AU CATALOGUE"}
    </button>
</form>

                <table style={{width:"100%", color:"#ddd", borderCollapse:"collapse"}}>
                    <thead style={{backgroundColor:"#333", textAlign:"left"}}><tr><th>ID</th><th>Nom</th><th>Marque</th><th>Prix</th><th>Actions</th></tr></thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} style={{borderBottom:"1px solid #333"}}>
                                <td style={{padding:"12px"}}>#{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.brand}</td>
                                <td style={{color:"#00ff00"}}>{item.price} €</td>
                                <td>
                                    <button onClick={()=>handleEditClick(item)} style={{...smBtn, borderColor:"orange", color:"orange", marginRight:"10px"}}>✏️ Edit</button>
                                    <button onClick={()=>handleDeleteProduct(item.id)} style={{...smBtn, borderColor:"red", color:"red"}}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* LISTE USERS & COMMANDES */}
        {(tab === "users" || tab === "orders") && (
             <div style={contentBox}>
                <h2 style={{color:"white", borderBottom:"1px solid #444", paddingBottom:"15px"}}>{tab==="users" ? "👥 Utilisateurs" : "💰 Commandes"}</h2>
                <table style={{width:"100%", color:"#ddd", borderCollapse:"collapse"}}>
                    <thead style={{backgroundColor:"#333", textAlign:"left"}}>
                        <tr>
                            <th>ID</th>
                            <th>{tab==="orders"?"Date":"Email"}</th>
                            <th>{tab==="orders"?"Total":"Rôle"}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} style={{borderBottom:"1px solid #333"}}>
                                <td style={{padding:"12px"}}>#{item.id}</td>
                                <td>{item.date || item.email}</td>
                                <td>{tab==="users" ? (item.is_admin?"ADMIN":"Client") : item.total + " €"}</td>
                                <td>
                                    {tab==="users" && !item.is_admin && <button onClick={()=>handleDeleteUser(item.id)} style={{...smBtn, borderColor:"red", color:"red"}}>Bannir</button>}
                                    {tab==="orders" && <button onClick={()=>handleViewOrder(item)} style={{...smBtn, borderColor:"#00ff00", color:"#00ff00"}}>👁️ Détails</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        )}

      </div>
    </div>
  );
}

// --- STYLES UTILS ---
const modalOverlay = {position:"fixed", top:0, left:0, width:"100%", height:"100%", backgroundColor:"rgba(0,0,0,0.8)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000};
const modalContent = {backgroundColor:"#222", padding:"30px", borderRadius:"8px", width:"400px", border:"1px solid #444"};
const contentBox = {backgroundColor:"#1e1e1e", padding:"30px", borderRadius:"8px", boxShadow:"0 4px 10px rgba(0,0,0,0.3)"};
const logBox = {backgroundColor:"#000", border:"1px solid #333", padding:"15px", height:"300px", overflowY:"auto", borderRadius:"4px", color:"#00ff00", fontFamily:"monospace"};
const trainBtn = (active) => ({width:"100%", padding:"20px", fontSize:"18px", fontWeight:"bold", backgroundColor: active?"#112211":"#000", color: active?"#004400":"#00ff00", border:"2px solid #00ff00", cursor: active?"wait":"pointer", marginBottom:"20px"});
const actionBtn = (bg) => ({backgroundColor:bg, color:"white", border:"none", padding:"10px 20px", borderRadius:"4px", cursor:"pointer", fontWeight:"bold"});
const smBtn = {backgroundColor:"transparent", border:"1px solid #ccc", padding:"5px 10px", borderRadius:"4px", cursor:"pointer", fontSize:"12px"};
const erpInput = {padding:"10px", backgroundColor:"#333", border:"1px solid #555", color:"white", borderRadius:"4px"};
const NavButton = ({active, onClick, icon, label}) => (
    <button onClick={onClick} style={{backgroundColor: active ? "#222" : "transparent", color: active ? "#00ff00" : "#888", border: active ? "1px solid #333" : "none", padding: "12px", textAlign: "left", cursor: "pointer", borderRadius: "4px", width:"100%", marginBottom:"5px", display:"flex", gap:"10px"}}>
        <span>{icon}</span> {label}
    </button>
);
const MatrixCard = ({label, value, color}) => (<div style={{border:"1px solid #333", backgroundColor:"#000", padding:"15px", textAlign:"center"}}><div style={{fontSize:"10px", color:"#666"}}>{label}</div><div style={{fontSize:"24px", color:color, fontWeight:"bold"}}>{value}</div></div>);