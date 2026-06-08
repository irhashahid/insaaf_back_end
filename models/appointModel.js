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

// matches: status ENUM('pending','accepted','rejected')'pending','accepted','rejected'
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

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByStatus,
  getAppointmentsByClient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  setAppointmentStatus,
};