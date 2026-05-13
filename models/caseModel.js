const { getDB } = require("../config/db");

async function getAllCases() {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT 
      c.id,
      c.case_type,
      c.description_case,
      c.client_id,
      c.lawyer_id,
      c.admin_id,
      c.phone,
      c.address,
      c.case_status,
      c.case_start_date,
      c.depart_concern,
      c.hearing_date,
      c.payment_status
    FROM cases c
    LEFT JOIN users   u ON c.client_id = u.id
    LEFT JOIN lawyers l ON c.lawyer_id = l.id
  `);
  return rows;
}

async function getCaseById(id) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM cases WHERE id = ?", [id]);
  return rows;
}

async function createCase({ 
  description_case, client_id, lawyer_id, phone,
  address, case_type, case_start_date, case_status,
  depart_concern, hearing_date, payment_status 
}, adminId) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO cases 
     (description_case, client_id, lawyer_id, phone, address, case_type,
      case_start_date, case_status, depart_concern, hearing_date, payment_status, admin_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [description_case, client_id, lawyer_id, phone, address, case_type,
     case_start_date, case_status, depart_concern, hearing_date, payment_status, adminId]
  );
  return result;
}

async function updateCase({ 
  description_case, phone, address, case_type,
  case_start_date, case_status, depart_concern,
  hearing_date, payment_status 
}, id, adminId) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE cases SET
      description_case=?, phone=?, address=?, case_type=?,
      case_start_date=?, case_status=?, depart_concern=?,
      hearing_date=?, payment_status=?
     WHERE id=? AND admin_id=?`,
    [description_case, phone, address, case_type,
     case_start_date, case_status, depart_concern,
     hearing_date, payment_status, id, adminId]
  );
  return result;
}

async function deleteCase(id, adminId) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM cases WHERE id=? AND admin_id=?",
    [id, adminId]
  );
  return result;
}

async function setCaseStatus(id, status) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE cases SET case_status = ? WHERE id = ?",
    [status, id]
  );
  return result;
}

async function getApprovedCases() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM cases WHERE case_status = 'approved'"
  );
  return rows;
}

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  setCaseStatus,
  getApprovedCases,
};