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

module.exports = {
  getAllLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  setLawyerStatus,
  getApprovedLawyers,
  renewLawyerSubscription,
};