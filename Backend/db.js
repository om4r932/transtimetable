import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

var pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Vérification de la connexion
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erreur de connexion à la base de données', err.stack)
    } else {
        console.log('Connecté à la base de données')
    }
});

export default pool;