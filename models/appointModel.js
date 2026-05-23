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

// matches: client_id, law_type, case_summary, date, time, mode, status
async function createAppointment(
  { case_type, case_summary, date, time, mode },
  clientId
) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO appointments 
     (client_id, law_type, case_summary, date, time, mode, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [clientId, law_type, case_summary, date, time, mode]
  );
  return result;
}

// matches: all updatable columns (not id, client_id, created_at)
async function updateAppointment(
  { client_name, law_type, case_summary, date, time, mode },
  id,
  clientId
) {
  const db = getDB();
  const [result] = await db.execute(
    `UPDATE appointments 
     SET client_name=?, law_type=?, case_summary=?, date=?, time=?, mode=?
     WHERE id=? AND client_id=?`,
    [client_name, law_type, case_summary, date, time, mode, id, clientId]
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
async function setAppointmentStatus(id, amount, status) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE appointments SET status=?, amount=? WHERE id=?",
    [status, amount, id]
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