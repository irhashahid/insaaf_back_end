const { getDB } = require("../config/db");

async function findByEmail(email) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
}

// Save reset token + expirry for usr
async function saveResetToken(email, token, expiry) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
    [token, expiry, email]
  );
  return result;
}

// Find usr by the  reset token
async function findByResetToken(token) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
    [token]
  );
  return rows;
}

// Update password + clear token
async function updatePasswordAndClearToken(userId, hashedPassword) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
    [hashedPassword, userId]
  );
  return result;
}


async function createUser(name, email, hash, role) {
  const db = getDB();
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hash, role]
  );
  return result;
}
//get all clients nd lawyers

async function getAllClients() {
  const db = getDB();
  const [rows] = await db.execute("SELECT id, name, email, location, status FROM users WHERE role = 'client'");
  return rows;
}

async function getAllLawyers() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT id, name, email, specialization, category, location, experience, cases, status FROM users WHERE role = 'lawyer'"
  );
  return rows;
}

// Update lawyer profile including specialization and category
async function updateUserProfile(userId, { specialization, category, location, experience, cases, license }) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE users 
     SET specialization = ?, category = ?, location = ?, experience = ?, cases = ?, license = ?
     WHERE id = ?`,
    [specialization, category, location, experience, cases, license, userId]
  );
  return result;
}

// Save license file path to user
async function saveLicense(userId, licensePath) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET license = ? WHERE id = ?",
    [licensePath, userId]
  );
  return result;
}

module.exports = { findByEmail, saveResetToken, findByResetToken, updatePasswordAndClearToken, createUser, getAllClients, getAllLawyers, updateUserProfile, saveLicense, };