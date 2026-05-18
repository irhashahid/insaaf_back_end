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
// body: { client_name, law_type, case_summary, date, time, mode }
async function create(req, res) {
  try {
    const { client_name, law_type, case_summary, date, time, mode } = req.body;

    if (!client_name || !law_type || !date || !time || !mode)
      return res.status(400).json({ error: "client_name, law_type, date, time, mode are required" });

    const result = await createAppointment(
      { client_name, law_type, case_summary, date, time, mode },
      req.user.id   // comes from JWT token
    );
    res.status(201).json({ message: "Appointment created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /appointments/:id
// body: { client_name, law_type, case_summary, date, time, mode }
async function update(req, res) {
  try {
    const { client_name, law_type, case_summary, date, time, mode } = req.body;
    const result = await updateAppointment(
      { client_name, law_type, case_summary, date, time, mode },
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
    const allowed = ["pending", "accepted", "rejected"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: "Invalid status: pending | accepted | rejected" });

    const result = await setAppointmentStatus(id, status);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });

    res.json({ message: `Appointment marked as ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, show, byStatus, byClient, create, update, remove, updateStatus };