const db = require('../config/db');

const getAllCases = () => {
  return db.query(`
    SELECT 
      c.id,
      c.case_type        AS title,
      c.description_case,
      c.client_id,
      c.lawyer_id,
      c.admin_id,
      c.phone,
      c.address,
      c.case_start_date,
    FROM cases c
    LEFT JOIN users   u ON c.client_id = u.id
    LEFT JOIN lawyers l ON c.lawyer_id = l.id
    LEFT JOIN admins  a ON c.admin_id = a.id
  `);
};

const getCaseById = (id) => {
  return db.query('SELECT * FROM cases WHERE id = ?', [id]);
};
async function getLawyerById(id) {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM lawyers WHERE id = ?", [id]);
  return rows;
}

async function createLawyer({ name, specialization, location, experience, cases, status }, userId) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO lawyers (name, email, specialization, location, experience, cases, status, user_id)
     VALUES (?, ?,?, ?, ?, ?, ?, ?, ?)`,
    [name, email, specialization, location, experience, cases, status, userId]
  );
  return result;
}

async function updateLawyer({ name, email, password, specialization, location, experience, cases, status }, id, userId) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE lawyers 
     SET name=?, email=?, password=?, specialization=?, location=?, experience=?, cases=?, status=?
     WHERE id=? AND user_id=?`,
    [name, email, password, specialization, location, experience, cases, status, id, userId]
  );
  return result;
}

const createCase = (data) => {
  const {
    description_case, client_id, lawyer_id, phone,
    address, case_type, case_start_date,
     depart_concern, hearing_date, payment_status
  } = data;
  return db.query(
    `INSERT INTO cases 
     (description_case, client_id, lawyer_id, phone, address, case_type,
      case_start_date, case_status, depart_concern, hearing_date, payment_status, admin_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?  ?, ?, NOW(), NOW())`,
    [description_case, client_id, lawyer_id, phone, address, case_type,
     case_start_date, case_status, depart_concern, hearing_date, payment_status, admin_id]
  );
};


const updateCase = (id, data) => {
const deleteCase = (id) => {
  return db.query('DELETE FROM cases WHERE id = ?', [id]);
};

const getApprovedCases = () => {
  return db.query("SELECT * FROM cases WHERE case_status = 'approved'");
};

module.exports = {
  getAllCases, getCaseById, createCase,
  updateCase, deleteCase, caseStatus, ApprovedCases
};