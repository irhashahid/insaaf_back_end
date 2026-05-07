const db = require('../config/db');

const getAllCases = () => {
  return db.query(`
    SELECT 
      c.id,
      c.case_type        AS title,
      c.description_case,
      c.client_id,
      c.lawyer_id,
      c.phone,
      c.address,
      c.case_status,
      c.payment_status,
      c.case_start_date,
      c.depart_concern,
      c.hearing_date
    FROM cases c
    LEFT JOIN users   u ON c.client_id = u.id
    LEFT JOIN lawyers l ON c.lawyer_id = l.id
  `);
};

const getCaseById = (id) => {
  return db.query('SELECT * FROM cases WHERE id = ?', [id]);
};

const createCase = (data) => {
  const {
    description_case, client_id, lawyer_id, phone,
    address, case_type, case_start_date,
    case_status, depart_concern, hearing_date, payment_status
  } = data;
  return db.query(
    `INSERT INTO cases 
     (description_case, client_id, lawyer_id, phone, address, case_type,
      case_start_date, case_status, depart_concern, hearing_date, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [description_case, client_id, lawyer_id, phone, address, case_type,
     case_start_date, case_status, depart_concern, hearing_date, payment_status]
  );
};

const updateCase = (id, data) => {
  const {
    description_case, phone, address, case_type,
    case_start_date, case_status, depart_concern, hearing_date, payment_status
  } = data;
  return db.query(
    `UPDATE cases SET
      description_case=?, phone=?, address=?, case_type=?,
      case_start_date=?, case_status=?, depart_concern=?,
      hearing_date=?, payment_status=?
     WHERE id=?`,
    [description_case, phone, address, case_type,
     case_start_date, case_status, depart_concern,
     hearing_date, payment_status, id]
  );
};

const deleteCase = (id) => {
  return db.query('DELETE FROM cases WHERE id = ?', [id]);
};

const setCaseStatus = (id, status) => {
  return db.query('UPDATE cases SET case_status = ? WHERE id = ?', [status, id]);
};

const getApprovedCases = () => {
  return db.query("SELECT * FROM cases WHERE case_status = 'approved'");
};

module.exports = {
  getAllCases, getCaseById, createCase,
  updateCase, deleteCase, setCaseStatus, getApprovedCases
};