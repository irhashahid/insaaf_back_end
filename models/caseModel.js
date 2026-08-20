const { getDB } = require("../config/db");

async function getAllCases() {
  const db = getDB();

  const [rows] = await db.execute(`
    SELECT c.id, c.case_type, c.name, c.description_case, c.client_id, c.lawyer_id, c.admin_id, c.phone, c.address, c.case_status, c.case_start_date, c.depart_concern, c.hearing_date, c.payment_status,
     cl.name as client_name, lw.name as lawyer_name
     FROM cases c
     LEFT JOIN users cl ON c.client_id = cl.id
     LEFT JOIN users lw ON c.lawyer_id = lw.id
  `);

  return rows;
}

async function getCaseById(id) {
  const db = getDB();

  const [rows] = await db.execute(
    "SELECT * FROM cases WHERE id = ?", [id]);
  return rows;
}

async function createCase({ 
  description_case, client_id, lawyer_id, phone,
  address, case_type, name, case_start_date, case_status,
  depart_concern, hearing_date, payment_status 
}, adminId) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO cases 
     (description_case, client_id, lawyer_id, phone, address, case_type, name,
    case_start_date, case_status, depart_concern, hearing_date, payment_status, admin_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [description_case, client_id, lawyer_id, phone, address, case_type, name, 
     case_start_date, case_status, depart_concern, hearing_date, payment_status, adminId]
  );
  return result;
}

async function updateCase({ 
  description_case, phone, address, case_type, name,
  case_start_date, case_status, depart_concern,
  hearing_date, payment_status 
}, id, adminId) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE cases SET
      description_case=?, phone=?, address=?, case_type=?, name=?,
      case_start_date=?, case_status=?, depart_concern=?,
      hearing_date=?, payment_status=?
     WHERE id=?`,
    [description_case, phone, address, case_type, name,
     case_start_date, case_status, depart_concern,
     hearing_date, payment_status, id ]
  );
  return result;
}

async function deleteCase(id) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM cases WHERE id=?",
    [id]
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
// matches: case_status ENUM('pending','approved','rejected','hearing','closed')
async function getApprovedCases() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT c.id, c.case_type, c.name, c.description_case, c.client_id, c.lawyer_id, c.admin_id, c.phone, c.address, c.case_status, c.case_start_date, c.depart_concern, c.hearing_date, c.payment_status,
     cl.name as client_name, lw.name as lawyer_name
     FROM cases c
     LEFT JOIN users cl ON c.client_id = cl.id
     LEFT JOIN users lw ON c.lawyer_id = lw.id
     WHERE c.case_status = 'approved'`
  );
  return rows;
}
// for client role
async function getCasesByClient(clientId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT c.id, c.case_type, c.name, c.description_case, c.client_id, c.lawyer_id, c.admin_id, c.phone, c.address, c.case_status, c.case_start_date, c.depart_concern, c.hearing_date, c.payment_status,
     cl.name as client_name, lw.name as lawyer_name
     FROM cases c
     LEFT JOIN users cl ON c.client_id = cl.id
     LEFT JOIN users lw ON c.lawyer_id = lw.id
     WHERE c.client_id = ?`,
    [clientId]
  );
  return rows;
}

// for lawyer role
async function getCasesByLawyer(lawyerId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT c.id, c.case_type, c.name, c.description_case, c.client_id, c.lawyer_id, c.admin_id, c.phone, c.address, c.case_status, c.case_start_date, c.depart_concern, c.hearing_date, c.payment_status,
     cl.name as client_name, lw.name as lawyer_name
     FROM cases c
     LEFT JOIN users cl ON c.client_id = cl.id
     LEFT JOIN users lw ON c.lawyer_id = lw.id
     WHERE c.lawyer_id = ?`,
    [lawyerId]
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
  getCasesByClient,
  getCasesByLawyer
};