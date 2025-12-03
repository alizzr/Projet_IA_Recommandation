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

// ➤ ROUTE : GET /products (avec filtre facultatif)
app.get("/products", (req, res) => {
    let results = products;

    // Si une catégorie est envoyée : http://localhost:5002/products?category=Laptop
    if (req.query.category) {
        results = results.filter(
            p => p.category.toLowerCase() === req.query.category.toLowerCase()
        );
    }

    res.json(results);
});

app.listen(5002, () => console.log("API PRODUITS démarrée sur http://localhost:5002"));
