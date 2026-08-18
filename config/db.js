const mysql = require("mysql2/promise");

let db;

async function initDB() {
  try {
    if (!db) {
      db = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "admin",
        password: process.env.DB_PASSWORD || "YourStrongPassword",
        database: process.env.DB_NAME || "insaaf_connect",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    const connection = await db.getConnection();
    console.log("MySQL Connected successfully");
    connection.release();
  } catch (err) {
    console.error("DB Connection Error:", err.message);
  }
}

function getDB() {
  if (!db) {
    db = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "insaaf_connect",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return db;
}

module.exports = { initDB, getDB };