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

// 👉 IMPORTANT : on n'écoute PAS ici
module.exports = app;
