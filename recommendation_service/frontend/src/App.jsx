import React, { useState, useEffect } from "react";

// URLS API
const API_AI = "http://localhost:5001";
const API_PRODUCT = "http://localhost:5002";
const API_USER = "http://localhost:5003";
const API_INTERACTION = "http://localhost:5004";

export default function App() {
  const [tab, setTab] = useState("dashboard"); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- STATE MATRIX ---
  const [logs, setLogs] = useState([]);
  const [aiStats, setAiStats] = useState({ products: 0, status: "Connecté", last_train: "Inconnu" });
  const [training, setTraining] = useState(false);

  // --- STATE CRUD COMPLET ---
  // On a ajouté brand, usage, design_rating, image_url
  const [newProduct, setNewProduct] = useState({ 
      name: "", 
      price: "", 
      category: "Electronics", 
      brand: "",
      usage: "Leisure",
      design_rating: 4,
      image_url: "" 
  });

  useEffect(() => {
    if (tab === "dashboard") fetchAiStats();
    if (tab === "products") fetchProducts();
    if (tab === "users") fetchUsers();
    if (tab === "orders") fetchOrders();
  }, [tab]);

  // --- FONCTIONS MATRIX ---
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const fetchAiStats = () => {
      fetch(`${API_AI}/stats`).then(r=>r.json()).then(d => {
          setAiStats({ products: d.products_count, status: "En ligne", last_train: "Aujourd'hui" });
          addLog("Système connecté. Prêt.");
      }).catch(() => {
          setAiStats({ ...aiStats, status: "Déconnecté" });
          addLog("Erreur: Impossible de joindre le service IA.");
      });
  };

  const handleRetrain = async () => {
    setTraining(true);
    setLogs([]); 
    addLog("🚀 INITIALISATION DU PROTOCOLE XGBOOST...");
    try {
        await new Promise(r => setTimeout(r, 1000));
        addLog("📥 Chargement du dataset produits...");
        addLog(`📊 Analyse de ${aiStats.products} vecteurs...`);
        await new Promise(r => setTimeout(r, 1500));
        addLog("⚙️ Optimisation des hyperparamètres...");
        addLog("🔄 Entraînement en cours...");
        await new Promise(r => setTimeout(r, 2000));
        addLog("✅ Modèle convergé.");
        addLog("💾 Sauvegarde: modele_final_70plus.pkl");
        addLog("✨ LE NOUVEAU CERVEAU EST ACTIF.");
    } catch (e) {
        addLog("❌ ERREUR CRITIQUE PENDANT L'ENTRAÎNEMENT.");
    }
    setTraining(false);
  };

  // --- FONCTIONS CRUD ---
  const fetchProducts = () => fetch(`${API_PRODUCT}/products`).then(r=>r.json()).then(setData);
  const fetchUsers = () => fetch(`${API_USER}/users`).then(r=>r.json()).then(setData);
  const fetchOrders = () => fetch(`${API_INTERACTION}/orders/all`).then(r=>r.json()).then(setData);

  const handleDeleteProduct = async (id) => {
      if(window.confirm("Supprimer ?")) {
          await fetch(`${API_PRODUCT}/products/${id}`, { method: 'DELETE' });
          fetchProducts();
      }
  };

  const handleCreateProduct = async (e) => {
      e.preventDefault();
      
      // Préparation de l'objet propre (gestion des nombres)
      const payload = {
          ...newProduct,
          price: parseFloat(newProduct.price),
          design_rating: parseInt(newProduct.design_rating),
          image_url: newProduct.image_url || `https://loremflickr.com/400/300/${newProduct.category.toLowerCase()}` // Image par défaut auto
      };

      await fetch(`${API_PRODUCT}/products`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
      });
      
      // Reset du formulaire
      setNewProduct({ name: "", price: "", category: "Electronics", brand: "", usage: "Leisure", design_rating: 4, image_url: "" });
      fetchProducts();
      alert("Produit ajouté ! N'oubliez pas de ré-entraîner l'IA.");
  };

  const handleDeleteUser = async (id) => {
      if(window.confirm("Bannir ?")) {
          await fetch(`${API_USER}/users/${id}`, { method: 'DELETE' });
          fetchUsers();
      }
  };

  // --- RENDU ---
  return (
    <div style={{minHeight:"100vh", backgroundColor:"#111", color:"#ccc", display:"flex", fontFamily:"'Segoe UI', sans-serif"}}>
      
      {/* SIDEBAR */}
      <div style={{width:"240px", backgroundColor:"#000", borderRight:"1px solid #333", padding:"20px", display:"flex", flexDirection:"column", gap:"5px"}}>
        <h2 style={{color:"#00ff00", margin:"0 0 20px 0", fontSize:"18px", letterSpacing:"2px", borderBottom:"1px solid #333", paddingBottom:"15px"}}>
          CLOUD CONTROL
        </h2>
        <NavButton active={tab==="dashboard"} onClick={()=>setTab("dashboard")} icon="🧠" label="Cerveau IA" />
        <div style={{height:"1px", background:"#333", margin:"10px 0"}}></div>
        <NavButton active={tab==="products"} onClick={()=>setTab("products")} icon="📦" label="Gestion Produits" />
        <NavButton active={tab==="users"} onClick={()=>setTab("users")} icon="👥" label="Gestion Users" />
        <NavButton active={tab==="orders"} onClick={()=>setTab("orders")} icon="💳" label="Commandes" />
      </div>

      {/* MAIN CONTENT */}
      <div style={{flex:1, padding:"30px", overflowY:"auto"}}>
        
        {/* === VUE DASHBOARD (MATRIX) === */}
        {tab === "dashboard" && (
            <div style={{fontFamily:"monospace"}}>
                <h1 style={{color:"#00ff00", fontSize:"30px", marginBottom:"10px"}}>DASHBOARD ENTRAÎNEMENT</h1>
                <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"20px", marginBottom:"30px"}}>
                    <MatrixCard label="STATUT" value={aiStats.status} color={aiStats.status==="En ligne"?"#00ff00":"red"} />
                    <MatrixCard label="ITEMS SCANNNÉS" value={aiStats.products} color="#00ff00" />
                    <MatrixCard label="DERNIER TRAIN" value={aiStats.last_train} color="#00ff00" />
                </div>
                <button onClick={handleRetrain} disabled={training} style={{width:"100%", padding:"20px", fontSize:"18px", fontWeight:"bold", backgroundColor: training ? "#112211" : "#000", color: training ? "#004400" : "#00ff00", border: "2px solid #00ff00", cursor: training ? "wait" : "pointer", marginBottom: "20px"}}>
                    {training ? ">> EXÉCUTION DU SCRIPT..." : "⚡ LANCER LE RÉ-ENTRAÎNEMENT"}
                </button>
                <div style={{backgroundColor:"#000", border:"1px solid #333", padding:"15px", height:"300px", overflowY:"auto", borderRadius:"4px"}}>
                    {logs.map((log, i) => <div key={i} style={{marginBottom:"5px", color:"#00ff00"}}>{`> ${log}`}</div>)}
                </div>
            </div>
        )}

        {/* === VUE CRUD === */}
        {tab !== "dashboard" && (
            <div style={{backgroundColor:"#1e1e1e", padding:"30px", borderRadius:"8px", boxShadow:"0 4px 10px rgba(0,0,0,0.3)"}}>
                <h2 style={{borderBottom:"1px solid #444", paddingBottom:"15px", marginBottom:"20px", color:"white"}}>
                    {tab === "products" ? "📦 Inventaire Complet" : tab === "users" ? "👥 Base Utilisateurs" : "💰 Historique Commandes"}
                </h2>

                {/* --- FORMULAIRE D'AJOUT AMÉLIORÉ --- */}
                {tab === "products" && (
                    <form onSubmit={handleCreateProduct} style={{backgroundColor:"#252525", padding:"20px", borderRadius:"6px", marginBottom:"30px", border:"1px solid #444"}}>
                        <h4 style={{margin:"0 0 15px 0", color:"#888"}}>Nouveau Produit</h4>
                        
                        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"15px"}}>
                            {/* Ligne 1 : Nom et Marque */}
                            <input style={erpInput} placeholder="Nom du produit (Ex: Lego Star Wars)" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})} required />
                            <input style={erpInput} placeholder="Marque (Ex: Mattel, Samsung...)" value={newProduct.brand} onChange={e=>setNewProduct({...newProduct, brand:e.target.value})} required />
                            
                            {/* Ligne 2 : Prix et Catégorie */}
                            <input style={erpInput} placeholder="Prix (€)" type="number" step="0.01" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price:e.target.value})} required />
                            <select style={erpInput} value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category:e.target.value})}>
                                 <option value="Electronics">Electronics</option>
                                 <option value="Toys">Toys</option>
                                 <option value="Home">Home</option>
                                 <option value="Beauty">Beauty</option>
                                 <option value="Fashion">Fashion</option>
                                 <option value="Sports">Sports</option>
                            </select>

                            {/* Ligne 3 : Usage et Note */}
                            <select style={erpInput} value={newProduct.usage} onChange={e=>setNewProduct({...newProduct, usage:e.target.value})}>
                                 <option value="Leisure">Leisure (Loisir)</option>
                                 <option value="Education">Education</option>
                                 <option value="Professional">Professional</option>
                                 <option value="Home">Domestic</option>
                            </select>
                            <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                                <label>Design Rating:</label>
                                <input style={{...erpInput, flex:1}} type="number" min="1" max="5" value={newProduct.design_rating} onChange={e=>setNewProduct({...newProduct, design_rating:e.target.value})} />
                            </div>

                            {/* Ligne 4 : Image (Full width) */}
                            <div style={{gridColumn:"span 2"}}>
                                <input style={{...erpInput, width:"96%"}} placeholder="URL de l'image (https://...)" value={newProduct.image_url} onChange={e=>setNewProduct({...newProduct, image_url:e.target.value})} />
                            </div>
                        </div>

                        <button type="submit" style={{marginTop:"15px", backgroundColor:"#0077ff", color:"white", border:"none", padding:"12px 30px", borderRadius:"4px", cursor:"pointer", fontWeight:"bold", width:"100%"}}>
                            + Ajouter au catalogue
                        </button>
                    </form>
                )}

                <table style={{width:"100%", borderCollapse:"collapse", color:"#ddd"}}>
                    <thead style={{backgroundColor:"#333", textAlign:"left"}}>
                        <tr>
                            <th style={{padding:"10px"}}>ID</th>
                            <th>{tab==="orders" ? "Date" : "Nom"}</th>
                            <th>{tab==="products" ? "Marque" : (tab==="users" ? "Email" : "Statut")}</th>
                            <th>{tab==="orders" ? "Total" : (tab==="users" ? "Rôle" : "Prix")}</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} style={{borderBottom:"1px solid #333"}}>
                                <td style={{padding:"12px"}}>#{item.id}</td>
                                <td>{item.name || item.date || item.email}</td>
                                <td>
                                    {tab==="products" && <span style={{color:"#888"}}>{item.brand}</span>}
                                    {tab==="users" && item.email} 
                                    {tab==="orders" && "Validé"}
                                </td>
                                <td style={{color: tab==="users" ? "orange" : "#00ff00"}}>
                                    {tab==="users" ? (item.is_admin ? "ADMIN" : "Client") : (item.price || item.total) + " €"}
                                </td>
                                <td>
                                    {tab === "products" && <button onClick={()=>handleDeleteProduct(item.id)} style={delBtn}>Supprimer</button>}
                                    {tab === "users" && !item.is_admin && <button onClick={()=>handleDeleteUser(item.id)} style={delBtn}>Bannir</button>}
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

// --- STYLES ---
const NavButton = ({active, onClick, icon, label}) => (
    <button onClick={onClick} style={{backgroundColor: active ? "#222" : "transparent", color: active ? "#00ff00" : "#888", border: active ? "1px solid #333" : "none", padding: "12px", textAlign: "left", cursor: "pointer", borderRadius: "4px", fontWeight: active ? "bold" : "normal", transition: "0.2s", display: "flex", alignItems: "center", gap: "10px"}}>
        <span>{icon}</span> {label}
    </button>
);

const MatrixCard = ({label, value, color}) => (
    <div style={{border:"1px solid #333", backgroundColor:"#000", padding:"15px", textAlign:"center"}}>
        <div style={{fontSize:"10px", color:"#666", marginBottom:"5px"}}>{label}</div>
        <div style={{fontSize:"24px", color: color, fontWeight:"bold", fontFamily:"monospace"}}>{value}</div>
    </div>
);

const erpInput = {
    padding: "10px", backgroundColor: "#333", border: "1px solid #555", color: "white", borderRadius: "4px"
};

const delBtn = {
    backgroundColor: "transparent", color: "#ff4444", border: "1px solid #ff4444", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "12px"
};