const { getDB } = require("../config/db");

// GET all ratings for a lawyer (with avg)
async function getLawyerRatings(lawyerId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT 
      r.*,
      u.name AS client_name,
      AVG(r.rating) OVER() AS average_rating
     FROM ratings r
     JOIN users u ON r.client_id = u.id
     WHERE r.lawyer_id = ?
     ORDER BY r.created_at DESC`,
    [lawyerId]
  );
  return rows;
}

// GET average rating only for a lawyer
async function getLawyerAvgRating(lawyerId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT 
      AVG(rating) AS average_rating,
      COUNT(*) AS total_ratings
     FROM ratings 
     WHERE lawyer_id = ?`,
    [lawyerId]
  );
  return rows[0];
}

// GET single rating by appointment
// prevents client from rating same appointment twice
async function getRatingByAppointment(appointmentId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM ratings WHERE appointment_id = ?",
    [appointmentId]
  );
  return rows;
}

// CREATE rating
async function createRating({ appointment_id, lawyer_id, rating, review }, clientId) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO ratings 
     (appointment_id, client_id, lawyer_id, rating, review)
     VALUES (?, ?, ?, ?, ?)`,
    [appointment_id, clientId, lawyer_id, rating, review ?? null]
  );
  return result;
}

// DELETE rating (client can remove their own)
async function deleteRating(id, clientId) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM ratings WHERE id = ? AND client_id = ?",
    [id, clientId]
  );
  return result;
}

module.exports = {
  getLawyerRatings,
  getLawyerAvgRating,
  getRatingByAppointment,
  createRating,
  deleteRating,
};