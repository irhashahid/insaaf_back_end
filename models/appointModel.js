const { getDB } = require("../config/db");

async function getAllAppointments() {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT 
      a.*,
      client.id AS client_id,
      client.name AS client_name,
      client.email AS client_email,
      lawyer.id AS lawyer_id,
      lawyer.name AS lawyer_name,
      lawyer.email AS lawyer_email
    FROM appointments a
    JOIN users client ON a.client_id = client.id
    JOIN users lawyer ON a.lawyer_id = lawyer.id
  `);
  return rows;
}
// matches: id column
async function getAppointmentById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM appointments WHERE id = ?",
    [id]
  );
  return rows;
}

// matches: status ENUM('pending','accepted','rejected')
async function getAppointmentsByStatus(status) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM appointments WHERE status = ?",
    [status]
  );
  return rows;
}

// matches: client_id → FOREIGN KEY → users.id
async function getAppointmentsByClient(clientId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM appointments WHERE client_id = ?",
    [clientId]
  );
  return rows;
}
// NEW: for lawyer role
async function getAppointmentsByLawyer(lawyerId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM appointments WHERE lawyer_id = ?",
    [lawyerId]
  );
  return rows;
}


// matches: 
async function createAppointment(
  { lawyer_id,
    law_type,
    case_type,
    short_description,
    slot_start_time,
    slot_end_time,
    appointment_mode
  },
  clientId
) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO appointments
     (
       client_id,
       lawyer_id,
       law_type,
       case_type,
       short_description,
       slot_start_time,
       slot_end_time,
       appointment_mode,
       status
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clientId,
      lawyer_id,
      law_type,
      case_type,
      short_description,
      slot_start_time,
      slot_end_time,
      appointment_mode,
      'pending'
    ]
  );
  return result;
}

// matches: all updatable columns (not id, client_id, created_at)
async function updateAppointment(
  { lawyer_id,
  law_type,
  case_type,
  short_description,
  slot_start_time,
  slot_end_time,
  appointment_mode
   },
  id,
  clientId
) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE appointments 
     SET
      lawyer_id=?, law_type=?, case_type=?, short_description=?, slot_start_time=?, slot_end_time=?, appointment_mode=?
     WHERE id=? AND client_id=?`,
    [lawyer_id, law_type, case_type, short_description, slot_start_time, slot_end_time, appointment_mode,  id, clientId]
  );
  return result;
}

// matches: id + client_id (only delete your own)
async function deleteAppointment(id, clientId) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM appointments WHERE id=? AND client_id=?",
    [id, clientId]
  );
  return result;
}

// matches: status ENUM('pending','accepted','rejected') nd money amnt
async function setAppointmentStatus(id, payment_amount, status) {
  const db = getDB();

  const [result] = await db.execute(
    "UPDATE appointments SET status=?, payment_amount=? WHERE id=?",
    [status, payment_amount, id]
  );
  return result;
}

// Client submits payment — cash or online with receipt
async function submitPayment(id, clientId, payment_mode, payment_receipt) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE appointments
     SET payment_mode = ?, payment_receipt = ?
     WHERE id = ? AND client_id = ?`,
    [payment_mode, payment_receipt, id, clientId]
  );
  return result;
}

// Lawyer approves payment → payment_status = 1
async function approvePayment(id, lawyerId) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE appointments
     SET payment_status = 1
     WHERE id = ? AND lawyer_id = ?`,
    [id, lawyerId]
  );
  return result;
}
// Convert an approved appointment into a case
async function convertToCase(appointmentId) {
  const db = getDB();

  // 1. Get the appointment / must belong to this lawyer + payment approved
  const [appt] = await db.execute(
    "SELECT * FROM appointments WHERE id = ?",
    [appointmentId]
  );

  if (appt.length === 0) return null;

  const a = appt[0];

  // 2. Get client's name nd phn number from users table
  const [client] = await db.execute(
    "SELECT name, phone, address FROM users WHERE id = ?",
    [a.client_id]
  );

  // 3. Insert into cases table / using valid ENUM value 'pending'
  const [result] = await db.execute(
    `INSERT INTO cases 
     (description_case, name, phone, address, case_type, case_start_date, case_status, depart_concern, hearing_date, payment_status, admin_id, client_id, lawyer_id, appointment_id)
     VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, NULL, ?, NULL, ?, ?, ?)`,
    [
      a.short_description,
      client[0]?.name ?? "Unknown",
      client[0]?.phone ?? "",             // phone -  has now phone column
      client[0]?.address ?? "",            // address -  now address column

      a.case_type,
      "pending",              // valid ENUM value ✅
      a.law_type,             // stored as depart_concern
      a.payment_status,
      a.client_id,
      a.lawyer_id,
      a.id // appointment_id for reference
    ]
  );

  return result;
}



module.exports = {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByStatus,
  getAppointmentsByClient,
  getAppointmentsByLawyer, // lawyr role
  createAppointment,
  updateAppointment,
  deleteAppointment,
  setAppointmentStatus,
  submitPayment,
  approvePayment,
  convertToCase,   //convrt the approved appointment into a case by lawyer and then admin will approve the case and then it will be listed in approved cases for client and lawyer both
};