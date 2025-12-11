const app = require("./app");

const PORT = 5002;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API PRODUITS démarrée sur http://0.0.0.0:${PORT}`);
});
