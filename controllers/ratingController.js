const {
  getLawyerRatings,
  getLawyerAvgRating,
  getRatingByAppointment,
  createRating,
  deleteRating,
} = require("../models/ratingModel");

const { getDB } = require("../config/db");
const { createNotification } = require("../models/notificationModel"); //  ADDED for notify

// GET /ratings/lawyer/:lawyerId
// all ratings + average for a lawyer
async function byLawyer(req, res) {
  try {
    const ratings = await getLawyerRatings(req.params.lawyerId);
    const avg = await getLawyerAvgRating(req.params.lawyerId);
    res.json({
      average_rating: avg.average_rating ?? 0,
      total_ratings: avg.total_ratings ?? 0,
      ratings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /ratings
// body: { appointment_id, lawyer_id, rating, review }
// only client can rate, only after payment_status = 1
async function create(req, res) {
  try {
    const { appointment_id, lawyer_id, rating, review } = req.body;

    // validate required fields
    if (!appointment_id || !lawyer_id || !rating)
      return res.status(400).json({
        error: "appointment_id, lawyer_id, rating are required",
      });

    // validate rating value 1-5
    if (rating < 1 || rating > 5)
      return res.status(400).json({
        error: "rating must be between 1 and 5",
      });

    // check appointment exists and payment is approved
    const db = getDB();
    const [appt] = await db.execute(
      "SELECT * FROM appointments WHERE id = ? AND client_id = ? AND payment_status = 1",
      [appointment_id, req.user.id]
    );

    if (appt.length === 0)
      return res.status(403).json({
        error: "You can only rate after payment is approved",
      });

    // check not already rated this appointment
    const existing = await getRatingByAppointment(appointment_id);
    if (existing.length > 0)
      return res.status(409).json({
        error: "You have already rated this appointment",
      });

    const result = await createRating(
      { appointment_id, lawyer_id, rating, review },
      req.user.id
    );

    // fetch client name for personalized notification
const [clientRows] = await db.execute(
  "SELECT name FROM users WHERE id = ?",
  [req.user.id]
);
const clientName = clientRows[0]?.name ?? "A client";

//  ADDED: notify lawyer that client has rated them
await createNotification({
  user_id: lawyer_id,
  title: "New Rating Received",
  body: `${clientName} rated you ${rating} stars`,
  type: "rating",
  ref_id: result.insertId,
});
    
    res.status(201).json({
      message: "Rating submitted successfully",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /ratings/:id
async function remove(req, res) {
  try {
    const result = await deleteRating(req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Rating not found or not yours" });
    res.json({ message: "Rating deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { byLawyer, create, remove };