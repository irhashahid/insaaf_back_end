const {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByStatus,
  getAppointmentsByClient,
  getAppointmentsByLawyer,   // role base lawyer
  createAppointment,
  updateAppointment,
  deleteAppointment,
  setAppointmentStatus,
  submitPayment,    //  add
  approvePayment,   //  add
  convertToCase,  //conversion
} = require("../models/appointModel");

const { findByEmail } = require("../models/userModel"); //role based access.ig its not using

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

// GET /appointments/filter?status=pending,accepted,rejected
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

// GET /appointments/mine  = role-based wrk
// client  → their own appointments (by client_id)
// lawyer  → assigned appointments (by lawyer_id)
// admin   → all appointments
async function myAppointments(req, res) {
  try {
    const { id, role } = req.user;

    let rows;
    if (role === "admin") {
      rows = await getAllAppointments();
    } else if (role === "lawyer") {
      rows = await getAppointmentsByLawyer(id);
    } else {
      // default: client
      rows = await getAppointmentsByClient(id);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /appointments
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
      !appointment_mode
    ) {
      return res.status(400).json({
        error: "Required fields missing"
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
  appointment_mode
} = req.body;
    const result = await updateAppointment(
      { lawyer_id, law_type, case_type, short_description, slot_start_time, slot_end_time, appointment_mode },
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
// PATCH /appointments/:id/pay
// body: { payment_mode, payment_receipt }
// called by CLIENT after paying
async function pay(req, res) {
  try {
    const { payment_mode, payment_receipt } = req.body;

    if (!payment_mode)
      return res.status(400).json({ error: "payment_mode required: Stripe | Manual" });

    const allowed = ["Stripe", "Manual"];
    if (!allowed.includes(payment_mode))
      return res.status(400).json({ error: "payment_mode must be Stripe or Manual" });

    const result = await submitPayment(
      req.params.id,
      req.user.id,
      payment_mode,
      payment_receipt ?? null
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found or not yours" });

    res.json({ message: "Payment submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /appointments/:id/approve-payment
// called by LAWYER after verifying payment proof
async function approvePay(req, res) {
  try {
    const result = await approvePayment(req.params.id, req.user.id);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found or not yours" });

    res.json({ message: "Payment approved, appointment fully booked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /appointments/:id/convert-to-case
// only lawyer can convert, only after payment approved
async function convertCase(req, res) {
  try {
    const result = await convertToCase(req.params.id, req.user.id);

    if (!result)
      return res.status(403).json({
        error: "Appointment not found, not yours, or payment not approved",
      });

    res.status(201).json({
      message: "Appointment converted to case successfully",
      caseId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, show, byStatus, byClient, myAppointments, create, update, remove, updateStatus, pay, approvePay, convertCase };