const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PRODUCTS_FILE = path.join(__dirname, "products.json");

// --- INITIALISATION BDD ---
async function initDB() {
    try {
        // 1. Création de la table
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                product_id INTEGER UNIQUE,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                price DECIMAL(10,2),
                brand VARCHAR(100),
                usage VARCHAR(100),
                design_rating INTEGER,
                image_url TEXT,
                fallback_url TEXT
            );
        `);
        console.log("✅ Table 'products' vérifiée/créée.");

        // 2. Seeding (Si vide)
        const { rows } = await db.query('SELECT COUNT(*) FROM products');
        const count = parseInt(rows[0].count);

        if (count === 0 && fs.existsSync(PRODUCTS_FILE)) {
            console.log("⚠️ Table vide. Importation automatique depuis products.json...");
            const rawData = fs.readFileSync(PRODUCTS_FILE);
            const products = JSON.parse(rawData);

            for (const p of products) {
                await db.query(`
                    INSERT INTO products (product_id, name, category, price, brand, usage, design_rating, image_url, fallback_url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    p.product_id, p.name, p.category, p.price, p.brand, p.usage, p.design_rating, p.image_url, p.fallback_url
                ]);
            }
            console.log(`🚀 ${products.length} produits importés avec succès !`);
        } else {
            console.log(`info : ${count} produits en base.`);
        }

    } catch (err) {
        console.error("❌ Erreur initDB:", err);
    }
}

// Lancement init au démarrage
initDB();

// --- ROUTE 1 : LISTE (GET) ---
app.get("/products", async (req, res) => {
    try {
        let query = 'SELECT * FROM products';
        let params = [];

        if (req.query.category) {
            query += ' WHERE LOWER(category) = LOWER($1)';
            params.push(req.query.category);
        }

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- ROUTE 2 : DÉTAIL (GET ONE) ---
app.get("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // Supporte id interne (PK) ou product_id (Legacy)
        const { rows } = await db.query(
            'SELECT * FROM products WHERE id = $1 OR product_id = $1',
            [id]
        );

        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ message: "Produit introuvable" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- ROUTE 3 : AJOUT (POST) ---
app.post("/products", async (req, res) => {
    const { product_id, name, category, price, brand, usage, design_rating, image_url, fallback_url } = req.body;

    try {
        // On génère un product_id si absent (Max + 1)
        let pid = product_id;
        if (!pid) {
            const { rows } = await db.query('SELECT MAX(product_id) as max_id FROM products');
            pid = (rows[0].max_id || 2000) + 1;
        }

        const { rows } = await db.query(`
            INSERT INTO products (product_id, name, category, price, brand, usage, design_rating, image_url, fallback_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [pid, name, category, price, brand, usage, design_rating, image_url, fallback_url]);

        console.log(`➕ Produit ajouté : ${name} (ID: ${pid})`);
        res.status(201).json(rows[0]);

    } catch (err) {
        console.error("❌ Erreur ajout:", err);
        res.status(500).json({ error: "Erreur lors de l'ajout" });
    }
});

// --- ROUTE 4 : SUPPRESSION (DELETE) ---
app.delete("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { rowCount } = await db.query(
            'DELETE FROM products WHERE id = $1 OR product_id = $1',
            [id]
        );

        if (rowCount > 0) {
            console.log(`🗑️ Produit supprimé (ID: ${id})`);
            res.json({ message: "Produit supprimé" });
        } else {
            res.status(404).json({ message: "Produit non trouvé" });
        }
    } catch (err) {
        console.error("❌ Erreur suppression:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// --- ROUTE 5 : MODIFICATION (PUT) ---
app.put("/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, category, price, brand, usage, design_rating, image_url, fallback_url } = req.body;

    // Pour simplifier l'exemple, on met tout à jour. 
    // En prod, il faudrait construire la requête dynamiquement selon les champs présents.
    try {
        const { rows } = await db.query(`
            UPDATE products 
            SET name = COALESCE($1, name),
                category = COALESCE($2, category),
                price = COALESCE($3, price),
                brand = COALESCE($4, brand),
                usage = COALESCE($5, usage),
                design_rating = COALESCE($6, design_rating),
                image_url = COALESCE($7, image_url),
                fallback_url = COALESCE($8, fallback_url)
            WHERE id = $9 OR product_id = $9
            RETURNING *
        `, [name, category, price, brand, usage, design_rating, image_url, fallback_url, id]);

        if (rows.length > 0) {
            console.log(`✏️ Produit modifié (ID: ${id})`);
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Produit introuvable" });
        }

    } catch (err) {
        console.error("❌ Erreur modif:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = app;