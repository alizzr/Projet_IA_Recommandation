const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.POSTGRES_DB || 'techshop_db',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

pool.on('error', (err, client) => {
    console.error('❌ Erreur inattendue sur le client PG', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
