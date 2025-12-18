const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Charger les produits
let products = [];
try {
    products = JSON.parse(fs.readFileSync("products.json", "utf8"));
} catch (err) {
    console.error("Erreur chargement JSON :", err);
}

// ROUTE : GET /products
app.get("/products", (req, res) => {
    let results = products;

    if (req.query.category) {
        results = results.filter(
            p => p.category.toLowerCase() === req.query.category.toLowerCase()
        );
    }

    res.json(results);
});

// --- ADMIN ROUTES ---
app.get("/admin/products", (req, res) => {
    res.json(products);
});

app.post("/admin/products", (req, res) => {
    const newProduct = { ...req.body, product_id: Date.now() };
    products.push(newProduct);
    saveProducts();
    res.json(newProduct);
});

app.put("/admin/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.product_id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        saveProducts();
        res.json(products[index]);
    } else {
        res.status(404).json({ message: "Produit non trouvé" });
    }
});

app.delete("/admin/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.product_id === id);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        res.json({ message: "Produit supprimé" });
    } else {
        res.status(404).json({ message: "Produit non trouvé" });
    }
});

function saveProducts() {
    fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
}

// 👉 IMPORTANT : on n'écoute PAS ici
module.exports = app;
