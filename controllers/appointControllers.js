const {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByStatus,
  getAppointmentsByClient,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  setAppointmentStatus,
} = require("../models/appointModel");

// GET /appointments
async function index(req, res) {
  try {
    res.json(await getAllAppointments());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /appointments/:id
async function show(req, res) {
  try {
    const rows = await getAppointmentById(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ error: "Appointment not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /appointments/filter?status=pending
// GET /appointments/filter?status=accepted
// GET /appointments/filter?status=rejected
async function byStatus(req, res) {
  try {
    const { status } = req.query;
    const allowed = ["pending", "accepted", "rejected"];
    if (!status || !allowed.includes(status))
      return res.status(400).json({ error: "Valid status required: pending | accepted | rejected" });
    res.json(await getAppointmentsByStatus(status));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /appointments/client/:clientId
async function byClient(req, res) {
  try {
    res.json(await getAppointmentsByClient(req.params.clientId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /appointments
// body: { id, law_type, case_type, time, mode, payment_mode, payment_amount, payment_receipt }
async function create(req, res) {
  try {

    const {
      lawyer_id,
      law_type,
      case_type,
      short_description,
      slot_start_time,
      slot_end_time,
      appointment_mode,
      payment_mode,
      payment_amount,
      payment_receipt
    } = req.body;

    // required fields
    if (
      !lawyer_id ||
      !law_type ||
      !case_type ||
      !short_description ||
      !slot_start_time ||
      !slot_end_time ||
      !appointment_mode ||
      !payment_mode
    ) {
      return res.status(400).json({
        error: "Required fields missing"
      });
    }

    // appointment mode validation
    const modes = ["online", "physical"];

    if (!modes.includes(appointment_mode.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid appointment mode"
      });
    }

    // payment mode validation
    const paymentModes = ["stripe", "manual"];

    if (!paymentModes.includes(payment_mode.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid payment mode"
      });
    }

    // stripe validation
    if (
      payment_mode.toLowerCase() === "stripe" &&
      (!payment_amount || !payment_receipt)
    ) {
      return res.status(400).json({
        error: "payment_amount and payment_receipt required for Stripe payments"
      });
    }

    const result = await createAppointment(
      {
        lawyer_id,
        law_type,
        case_type,
        short_description,
        slot_start_time,
        slot_end_time,
        appointment_mode,
        payment_mode,
        payment_amount,
        payment_receipt
      },
      req.user.id
    );

    res.status(201).json({
      message: "Appointment created",
      id: result.insertId
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}

// PUT /appointments/:id
async function update(req, res) {
  try {
    console.log("params id:", req.params.id);
    console.log("user:", req.user);
    console.log("body:", req.body);

    const {
  lawyer_id,
  law_type,
  case_type,
  short_description,
  slot_start_time,
  slot_end_time,
  appointment_mode,
  payment_mode,
  payment_amount,
  payment_receipt
} = req.body;
    const result = await updateAppointment(
      { lawyer_id, law_type, case_type, short_description, slot_start_time, slot_end_time, appointment_mode, payment_mode, payment_amount, payment_receipt },
      req.params.id,
      req.user.id   // only update your own appointment
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Appointment updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /appointments/:id
async function remove(req, res) {
  try {
    const result = await deleteAppointment(req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /appointments/:id/accepted  → Accept button
// PATCH /appointments/:id/rejected  → Reject button
// PATCH /appointments/:id/pending   → Reset (↺) button
async function updateStatus(req, res) {
  try {
    const { id, status } = req.params;
    const { payment_amount } = req.body;
    const allowed = ["pending", "accepted", "rejected"];

if (!allowed.includes(status.toLowerCase()))
  return res.status(400).json({
    error: "Invalid status: pending | accepted | rejected"
  });

if (
  status.toLowerCase() === "accepted" &&
  !payment_amount
) {
  return res.status(400).json({
    error: "payment_amount required when accepting appointment"
  });
}

const result = await setAppointmentStatus(
  id,
  payment_amount,
  status.toLowerCase()
);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });

    res.json({ message: `Appointment marked as ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, show, byStatus, byClient, create, update, remove, updateStatus };