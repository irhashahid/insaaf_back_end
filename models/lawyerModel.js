const { getDB } = require("../config/db");

async function getAllLawyers() {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users");
  return rows;
}

async function getLawyerById(id) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM lawyers WHERE id = ?", [id]);
  return rows;
}

async function createLawyer({ name, email, password, specialization, location, experience, cases, status, role}) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO lawyers (name, email, password, specialization, location, experience, cases, status, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'lawyer')`,
    [name, email, password, specialization, location, experience, cases, status, role]
  );
  return result;
}

async function updateLawyer({ name, email, password, specialization, location, experience, cases, status, role }, id) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE lawyers 
     SET name=?, email=?, password=?, specialization=?, location=?, experience=?, cases=?, status=1, role=lawyer
     WHERE id=? `,
    [name, email, password, specialization, location, experience, cases, status, role, id]
  );
  return result;
}

async function deleteLawyer(id) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM lawyers WHERE id=?",
    [id]
  );
  return result;
}

async function setLawyerStatus(id, status) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE users SET status = ? WHERE id = ?",
    [status, id]
  );
  return result;
}

async function getApprovedLawyers() {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM users WHERE status = 1");
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