// src/config/db.js
// Single shared PostgreSQL connection pool — imported by all models
const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME     || 'kanbanflow',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
  process.exit(1);
});

module.exports = pool;
