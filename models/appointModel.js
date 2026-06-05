const { getDB } = require("../config/db");

// matches: SELECT all columns from appointments
async function getAllAppointments() {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM appointments");
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


}

// matches: all updatable columns (not id, client_id, created_at)
async function updateAppointment(
  { lawyer_id,
  law_type,
  case_type,
  short_description,
  slot_start_time,
  slot_end_time,
  appointment_mode,
  payment_mode,
  payment_amount,
  payment_receipt },
  id,
  clientId
) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE appointments 
     SET
      lawyer_id=?, law_type=?, case_type=?, short_description=?, slot_start_time=?, slot_end_time=?, appointment_mode=?, payment_mode=?, payment_amount=?, payment_receipt=?
     WHERE id=? AND client_id=?`,
    [lawyer_id, law_type, case_type, short_description, slot_start_time, slot_end_time, appointment_mode, payment_mode, payment_amount, payment_receipt, id, clientId]
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