const { getDB } = require("../config/db");
const bcrypt = require('bcrypt');

async function getAllLawyers() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT id, name, email, specialization, category, location, experience, cases, status, subscription_end_date FROM users WHERE role = 'lawyer'"
  );
  return rows;
}

async function getLawyerById(id) {
  const db = getDB();
  const [rows] = await db.execute("SELECT id, name, email, specialization, category, location, experience, cases, status, subscription_end_date FROM users WHERE id = ? AND role = 'lawyer'", [id]);
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
  if (password && password.trim() !== '') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `UPDATE users 
       SET name=?, email=?, password=?, specialization=?, location=?, experience=?, cases=?
       WHERE id=? AND role='lawyer'`,
      [name, email, hashedPassword, specialization, location, experience, cases, id]
    );
    return result;
  } else {
    const [result] = await db.execute(
      `UPDATE users 
       SET name=?, email=?, specialization=?, location=?, experience=?, cases=?
       WHERE id=? AND role='lawyer'`,
      [name, email, specialization, location, experience, cases, id]
    );
    return result;
  }
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
  const [rows] = await db.execute("SELECT id, name, email, specialization, category, location, experience, cases, status, subscription_end_date FROM users WHERE status = 1 AND role = 'lawyer'");
  return rows;
}

async function renewLawyerSubscription(id) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET subscription_end_date = DATE_ADD(IFNULL(subscription_end_date, CURDATE()), INTERVAL 30 DAY), status = 1 WHERE id = ? AND role = 'lawyer'",
    [id]
  );
  return result;
}

async function revokeLawyerSubscription(id) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET subscription_end_date = NULL, status = 0 WHERE id = ? AND role = 'lawyer'",
    [id]
  );
  return result;
}

async function getSubscriptionStats() {
  const db = getDB();
  const [lawyers] = await db.execute("SELECT id, name, status, subscription_end_date FROM users WHERE role = 'lawyer'");
  
  let activeCount = 0;
  let expiredCount = 0;
  const now = new Date();
  
  lawyers.forEach(lawyer => {
    if (lawyer.subscription_end_date && new Date(lawyer.subscription_end_date) >= now) {
      activeCount++;
    } else {
      expiredCount++;
    }
  });

  const [settings] = await db.execute("SELECT setting_value FROM settings WHERE setting_key = 'subscription_fee'");
  const subscriptionFee = settings.length > 0 ? parseFloat(settings[0].setting_value) : 0;

  return { activeCount, expiredCount, subscriptionFee, lawyers };
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
  getSubscriptionStats,
};