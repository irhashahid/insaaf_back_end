const bcrypt = require("bcrypt");
const { getDB } = require("../config/db");

async function getAllLawyers() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE role = 'lawyer'"
  );
  return rows;
}

async function getLawyerById(id) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ? AND role = 'lawyer'", [id]);
  return rows;
}

async function createLawyer({ name, email, password, specialization, location, experience, cases }) {
  const db = getDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, specialization, location, experience, cases, status, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, specialization, location, experience, cases, 1, 'lawyer']
  );
  return result;
}

async function updateLawyer({ name, email, password, specialization, location, experience, cases }, id) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE users 
     SET name=?, email=?, password=?, specialization=?, location=?, experience=?, cases=?, status=?, role=?
     WHERE id=? `,
    [name, email, password, specialization, location, experience, cases, 1, 'lawyer', id]
  );
  return result;
}

async function deleteLawyer(id) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM users WHERE id=? AND role='lawyer'",
    [id]
  );
  return result;
}

async function setLawyerStatus(id, status) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET status = ? WHERE id = ? AND role = 'lawyer'",
    [status, id]
  );
  return result;
}

async function getApprovedLawyers() {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users WHERE status = 1 AND role = 'lawyer'");
  return rows;
}

// Renew lawyer subscription by 30 days
async function renewLawyerSubscription(id) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE users 
     SET subscription_expiry = DATE_ADD(IFNULL(subscription_expiry, NOW()), INTERVAL 30 DAY)
     WHERE id = ? AND role = 'lawyer'`,
    [id]
  );
  return result;
}

// Revoke lawyer subscription
async function revokeLawyerSubscription(id) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET subscription_expiry = NOW() WHERE id = ? AND role = 'lawyer'",
    [id]
  );
  return result;
}

// Get subscription stats for admin
async function getSubscriptionStats() {
  const db = getDB();

  const [lawyers] = await db.execute(
    "SELECT id, name, email, subscription_expiry FROM users WHERE role = 'lawyer'"
  );

  const [settings] = await db.execute(
    "SELECT setting_value FROM settings WHERE setting_key = 'subscription_fee'"
  );

  const now = new Date();

  const activeCount = lawyers.filter(l => l.subscription_expiry && new Date(l.subscription_expiry) > now).length;
  const expiredCount = lawyers.length - activeCount;
  const subscriptionFee = settings.length > 0 ? settings[0].setting_value : 0;

  return { 
    activeCount,
    expiredCount,
    subscriptionFee,
    lawyers };
}

module.exports = {
  getAllLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  setLawyerStatus,
  getApprovedLawyers,
  renewLawyerSubscription,
  revokeLawyerSubscription,
  getSubscriptionStats
};