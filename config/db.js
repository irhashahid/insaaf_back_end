const mysql = require("mysql2/promise");

let db;

async function initDB() {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "admin",
      password: "YourStrongPassword",
      database: "insaaf_connect",
    });
    console.log("MySQL Connected");
  } catch (err) {
    console.error("DB Error:", err);
  }
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };