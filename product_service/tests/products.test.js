const request = require("supertest");
const app = require("../server");

describe("Product Service API", () => {

    test("GET /products retourne la liste des produits", async () => {
        const res = await request(app).get("/products");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /products?category=xxx filtre correctement", async () => {
        const res = await request(app).get("/products?category=Laptop");
        expect(res.statusCode).toBe(200);

        // Tous les produits doivent être de la catégorie Laptop
        res.body.forEach(p => {
            expect(p.category.toLowerCase()).toBe("laptop");
        });
    });

    test("GET /products?category=unknown renvoie une liste vide", async () => {
        const res = await request(app).get("/products?category=UnknownCategory123");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(0);
    });

});
