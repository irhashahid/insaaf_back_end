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

// Admin dashboard stats
async function getAdminStats() {
  const db = getDB();

  // total earnings (all time)
  const [totalEarnings] = await db.execute(
    "SELECT COALESCE(SUM(payment_amount), 0) AS total FROM appointments WHERE payment_status = 1"
  );

  // monthly earnings (current month)
  const [monthlyEarnings] = await db.execute(
    `SELECT COALESCE(SUM(payment_amount), 0) AS monthly 
     FROM appointments 
     WHERE payment_status = 1 
     AND MONTH(created_at) = MONTH(NOW()) 
     AND YEAR(created_at) = YEAR(NOW())`
  );

  // total payments count
  const [totalPayments] = await db.execute(
    "SELECT COUNT(*) AS count FROM appointments WHERE payment_status = 1"
  );

  // total cases
  const [totalCases] = await db.execute(
    "SELECT COUNT(*) AS count FROM cases"
  );

  // total lawyers
  const [totalLawyers] = await db.execute(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'lawyer'"
  );

  // pending lawyers
  const [pendingLawyers] = await db.execute(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'lawyer' AND status = 0"
  );

  // total clients
  const [totalClients] = await db.execute(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'client'"
  );

  return {
    total_earnings: totalEarnings[0].total,
    monthly_earnings: monthlyEarnings[0].monthly,
    total_payments: totalPayments[0].count,
    total_cases: totalCases[0].count,
    total_lawyers: totalLawyers[0].count,
    pending_lawyers: pendingLawyers[0].count,
    total_clients: totalClients[0].count,
  };
}
// Lwer dshbrd stats
async function getLawyerStats(lawyerId) {
  const db = getDB();

  // ttal ernings frm approved payments fr this lwyr
  const [totalEarnings] = await db.execute(
    "SELECT COALESCE(SUM(payment_amount), 0) AS total FROM appointments WHERE payment_status = 1 AND lawyer_id = ?",
    [lawyerId]
  );

  // mothly ernings like th current month) fr this lwyr
  const [monthlyEarnings] = await db.execute(
    `SELECT COALESCE(SUM(payment_amount), 0) AS monthly 
     FROM appointments 
     WHERE payment_status = 1 
     AND lawyer_id = ?
     AND MONTH(created_at) = MONTH(NOW()) 
     AND YEAR(created_at) = YEAR(NOW())`,
    [lawyerId]
  );

  // total paymnts count fr this lwyr
  const [totalPayments] = await db.execute(
    "SELECT COUNT(*) AS count FROM appointments WHERE payment_status = 1 AND lawyer_id = ?",
    [lawyerId]
  );

  // total cases for this lwyr
  const [totalCases] = await db.execute(
    "SELECT COUNT(*) AS count FROM cases WHERE lawyer_id = ?",
    [lawyerId]
  );

  // pnding cases for this lwyr
  const [pendingCases] = await db.execute(
    "SELECT COUNT(*) AS count FROM cases WHERE lawyer_id = ? AND case_status = 'pending'",
    [lawyerId]
  );

  // active cases (hearing stage) for this lawyer
  const [activeCases] = await db.execute(
    "SELECT COUNT(*) AS count FROM cases WHERE lawyer_id = ? AND case_status = 'hearing'",
    [lawyerId]
  );

  // total appointments for this lawyer
  const [totalAppointments] = await db.execute(
    "SELECT COUNT(*) AS count FROM appointments WHERE lawyer_id = ?",
    [lawyerId]
  );

  // pnding appointnts for this lwyr
  const [pendingAppointments] = await db.execute(
    "SELECT COUNT(*) AS count FROM appointments WHERE lawyer_id = ? AND status = 'pending'",
    [lawyerId]
  );

  return {
    total_earnings: totalEarnings[0].total,
    monthly_earnings: monthlyEarnings[0].monthly,
    total_payments: totalPayments[0].count,
    total_cases: totalCases[0].count,
    pending_cases: pendingCases[0].count,
    active_cases: activeCases[0].count,
    total_appointments: totalAppointments[0].count,
    pending_appointments: pendingAppointments[0].count,
  };
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
  getCasesByLawyer,
  getAdminStats, // admn dashbrd mnthly stats
  getLawyerStats, // lwyr dashbrd mnthly stats
};