const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const { Pool } = pg;

// Pool de connexions PostgreSQL.
// Render fournit une seule variable DATABASE_URL : on l'utilise directement.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render impose SSL pour les connexions à une base externe.
  // En local (pas de "render.com" dans l'URL), on désactive SSL.
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL inattendue :', err);
  process.exit(-1);
});

// Helper pratique pour exécuter une requête : query('SELECT ...', [params])
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };