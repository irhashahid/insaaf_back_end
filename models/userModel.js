const { getDB } = require("../config/db");

async function findByEmail(email) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
}

async function createUser(name, email, hash, role) {
  const db = getDB();
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hash, role]
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