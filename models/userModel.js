const { getDB } = require("../config/db");

async function findByEmail(email) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
}

async function createUser(email, hash) {
  const db = getDB();
  const [result] = await db.execute(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hash]
  );
  return result;
}

module.exports = { findByEmail, createUser };