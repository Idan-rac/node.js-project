const { Pool } = require("pg");

const DB_HOST = process.env.DB_HOST || "db";
const DB_PORT = parseInt(process.env.DB_PORT || "5432", 10);
const DB_NAME = process.env.DB_NAME || "appdb";
const DB_USER = process.env.DB_USER || "appuser";
const DB_PASSWORD = process.env.DB_PASSWORD || "apppass";

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
