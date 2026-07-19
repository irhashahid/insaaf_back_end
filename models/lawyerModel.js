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
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, specialization, location, experience, cases, status, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password, specialization, location, experience, cases, 1, 'lawyer']
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

module.exports = {
  getAllLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  setLawyerStatus,
  getApprovedLawyers,
};