const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Chemin absolu sécurisé vers le fichier JSON
const DATA_FILE = path.join(__dirname, "products.json");

// --- CHARGEMENT DES PRODUITS ---
let products = [];
try {
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, "utf8");
        products = JSON.parse(fileContent);
        console.log(`✅ Catalogue chargé : ${products.length} produits.`);
    } else {
        console.log("⚠️ Fichier products.json introuvable, démarrage vide.");
    }
} catch (err) {
    console.error("❌ Erreur critique chargement JSON :", err);
}

// --- FONCTION DE SAUVEGARDE ---
function saveProducts() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
        console.log("💾 Sauvegarde sur disque effectuée.");
    } catch (e) {
        console.error("❌ Erreur lors de l'écriture sur le disque :", e);
    }
}

// --- ROUTE 1 : LISTE (GET) ---
app.get("/products", (req, res) => {
    let results = products;

    // Filtre par catégorie si demandé
    if (req.query.category) {
        results = results.filter(
            p => p.category && p.category.toLowerCase() === req.query.category.toLowerCase()
        );
    }
    res.json(results);
});

// --- ROUTE 2 : DÉTAIL (GET ONE) ---
app.get("/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => (p.id === id || p.product_id === id));
    if (product) res.json(product);
    else res.status(404).json({ message: "Introuvable" });
});

// --- ROUTE 3 : AJOUT (POST) ---
// CORRECTION : On écoute sur "/products" (pas /admin) pour matcher le React
app.post("/products", (req, res) => {
    
    // 1. Calculer le prochain ID (Max + 1)
    let maxId = 0;
    products.forEach(p => {
        const pid = p.id || p.product_id || 0;
        if (pid > maxId) maxId = pid;
    });
    const newId = maxId + 1;

    // 2. Créer le produit
    const newProduct = {
        id: newId,             // Standard React
        product_id: newId,     // Compatibilité ancienne
        ...req.body
    };

    // 3. Ajouter et Sauvegarder
    products.push(newProduct);
    saveProducts();

    console.log(`➕ Produit ajouté : ${newProduct.name} (ID: ${newId})`);
    res.status(201).json(newProduct);
});

// --- ROUTE 4 : SUPPRESSION (DELETE) ---
app.delete("/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = products.length;

    // On garde tout ce qui n'est PAS cet ID
    products = products.filter(p => (p.id !== id && p.product_id !== id));

    if (products.length < initialLength) {
        saveProducts(); // Sauvegarde la suppression
        console.log(`🗑️ Produit supprimé (ID: ${id})`);
        res.json({ message: "Produit supprimé avec succès" });
    } else {
        res.status(404).json({ message: "Produit non trouvé" });
    }
});

module.exports = app;