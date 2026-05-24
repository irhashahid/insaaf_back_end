const { getDB } = require("../config/db");

async function getAllCases() {
  const db = getDB();

  const [rows] = await db.execute(`
    SELECT 
      id,
      case_type,
      name,
      description_case,
      client_id,
      lawyer_id,
      admin_id,
      phone,
      address,
      case_status,
      case_start_date,
      depart_concern,
      hearing_date,
      payment_status
    FROM cases
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