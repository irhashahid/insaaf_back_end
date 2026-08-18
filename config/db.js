const mysql = require("mysql2/promise");

let db;

function initDB() {
  try {
    db = mysql.createPool({
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