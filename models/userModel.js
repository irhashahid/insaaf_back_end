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
//gte all lawyers and clients
async function getAllLawyers() {
  const db = getDB();
  const [rows] = await db.execute("SELECT id, name, email, specialization, location, experience, cases, status FROM users WHERE role = 'lawyer'"
  );
  return rows;
}

async function getAllClients() {
  const db = getDB();
  const [rows] = await db.execute("SELECT id, name, email, location, status FROM users WHERE role = 'client'");
  return rows;
}

module.exports = { findByEmail, createUser, getAllLawyers, getAllClients };