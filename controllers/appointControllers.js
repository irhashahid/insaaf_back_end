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
  submitPayment,    
  approvePayment,   
  convertToCase,  //conversion
} = require("../models/appointModel");


const { createNotification } = require("../models/notificationModel"); //  add for notify
const { getDB } = require("../config/db"); //  ADDED — needed to look up client_id for notifications

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
// client   their own appointments (by client_id)
// lawyer   assigned appointments (by lawyer_id)
// admin    all appointments
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

    const effectiveClientId = req.body.clientId || req.body.client_id;
    const {
      lawyer_id,
      date,
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

    // required fields validation
    const missing = [];
    if (!lawyer_id) missing.push("lawyer_id");
    if (!date) missing.push("date");
    if (!law_type) missing.push("law_type");
    if (!case_type) missing.push("case_type");
    if (!short_description) missing.push("short_description");
    if (!slot_start_time) missing.push("slot_start_time");
    if (!slot_end_time) missing.push("slot_end_time");
    if (!appointment_mode) missing.push("appointment_mode");
    if (req.user.role === 'admin' && !effectiveClientId) missing.push("client_id");

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Required fields missing: ${missing.join(", ")}`
      });
    }

    const targetClientId = (req.user.role === 'admin' && effectiveClientId) ? effectiveClientId : req.user.id;

    const result = await createAppointment(
      {
        lawyer_id,
        date,
        law_type,
        case_type,
        short_description,
        slot_start_time,
        slot_end_time,
        appointment_mode,
      },
      targetClientId
    );

    // fetch client name and send notifications
try {
  const db = getDB();
  const [clientRows] = await db.execute(
    "SELECT name FROM users WHERE id = ?",
    [targetClientId]
  );
  const clientName = clientRows[0]?.name ?? "A client";
// fetch lawyer name
  const [lawyerRows] = await db.execute(
    "SELECT name FROM users WHERE id = ?",
    [lawyer_id]
  );
  const lawyerName = lawyerRows[0]?.name ?? "A lawyer";
  
  // notify lawyer
  await createNotification({
    user_id: lawyer_id,
    title: "New Appointment Request",
    body: `${clientName} has booked an appointment with you`,
    type: "appointment",
    ref_id: result.insertId,
  });

  // notify admin
  const [admins] = await db.execute(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  );
  if (admins.length > 0) {
    await createNotification({
      user_id: admins[0].id,
      title: "New Appointment Booked",
      body: `${clientName} has booked an appointment with ${lawyerName}`,
      type: "account",
      ref_id: result.insertId,
    });
  }
} catch (notifErr) {
  console.warn("Could not dispatch appointment notification:", notifErr.message);
}

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
    const {
      lawyer_id,
      date,
      law_type,
      case_type,
      short_description,
      slot_start_time,
      slot_end_time,
      appointment_mode
    } = req.body;

    const result = await updateAppointment(
      { lawyer_id, date, law_type, case_type, short_description, slot_start_time, slot_end_time, appointment_mode },
      req.params.id,
      req.user.id,
      req.user.role
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
    const result = await deleteAppointment(req.params.id, req.user.id, req.user.role);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /appointments/:id/accepted or rejcted or pending  

  
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

    //  ADDED: notify client about status change
    const db = getDB();
const [appt] = await db.execute(
  "SELECT client_id, lawyer_id FROM appointments WHERE id = ?", [id]
);
if (appt.length > 0) {
  // fetch lawyer name now 
  const [lawyerRows] = await db.execute(
    "SELECT name FROM users WHERE id = ?", [appt[0].lawyer_id]
  );
  const lawyerName = lawyerRows[0]?.name ?? "Your lawyer";

  await createNotification({
    user_id: appt[0].client_id,
    title: `Appointment ${status}`,
    body: `${lawyerName} has ${status.toLowerCase()} your appointment`,
    type: "appointment",
    ref_id: parseInt(id),
  });
}

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
      return res.status(400).json({ error: "payment_mode required: Pay Online | Pay in Cash" });

    const allowed = ["Pay Online", "Pay in Cash"];
    if (!allowed.includes(payment_mode))
      return res.status(400).json({ error: "payment_mode must be Pay Online or Pay in Cash" });

    const result = await submitPayment(
      req.params.id,
      req.user.id,
      payment_mode,
      payment_receipt ?? null
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found or not yours" });

    const db = getDB();
    const [appt] = await db.execute(
      "SELECT lawyer_id FROM appointments WHERE id = ?", [req.params.id]
    );

    if (appt.length > 0) {
      // fetch client name FIRST
      const [clientRows] = await db.execute(
        "SELECT name FROM users WHERE id = ?", [req.user.id]
      );
      const clientName = clientRows[0]?.name ?? "A client";

      // notify lawyer
      await createNotification({
        user_id: appt[0].lawyer_id,
        title: "Payment Submitted",
        body: `${clientName} has submitted payment for your review`,
        type: "payment",
        ref_id: parseInt(req.params.id),
      });

      // notify admin
      const [admins] = await db.execute(
        "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
      );
      if (admins.length > 0) {
        await createNotification({
          user_id: admins[0].id,
          title: "Payment Submitted",
          body: `${clientName} has submitted payment for an appointment`,
          type: "account",
          ref_id: parseInt(req.params.id),
        });
      }
    }

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

    const db = getDB();
    const [appt] = await db.execute(
      "SELECT client_id, lawyer_id FROM appointments WHERE id = ?",
      [req.params.id]
    );

    if (appt.length > 0) {
      // fetch lawyer name
      const [lawyerRows] = await db.execute(
        "SELECT name FROM users WHERE id = ?",
        [appt[0].lawyer_id]
      );
      const lawyerName = lawyerRows[0]?.name ?? "Your lawyer";

      // notify client
      await createNotification({
        user_id: appt[0].client_id,
        title: "Payment Approved",
        body: `${lawyerName} has approved your payment. Appointment is fully booked!`,
        type: "payment",
        ref_id: parseInt(req.params.id),
      });

      // notify admin
      const [admins] = await db.execute(
        "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
      );
      if (admins.length > 0) {
        await createNotification({
          user_id: admins[0].id,
          title: "Payment Approved",
          body: `${lawyerName} has approved client payment for appointment`,
          type: "account",
          ref_id: parseInt(req.params.id),
        });
      }
    }

    res.json({ message: "Payment approved, appointment fully booked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /appointments/:id/convert-to-case
// only lawyer can convert, only after payment is approved 
async function convertCase(req, res) {
  try {
    const result = await convertToCase(req.params.id, req.user.id, req.user.role);
    if (!result)
      return res.status(403).json({
        error: "Appointment not found, not yours, or payment not approved",
      });

    const db = getDB();
    const [appt] = await db.execute(
      "SELECT client_id, lawyer_id FROM appointments WHERE id = ?", [req.params.id]
    );

    if (appt.length > 0) {
      // fetch lawyer name FIRST
      const [lawyerRows] = await db.execute(
        "SELECT name FROM users WHERE id = ?", [appt[0].lawyer_id]
      );
      const lawyerName = lawyerRows[0]?.name ?? "Your lawyer";

      // notify client
      await createNotification({
        user_id: appt[0].client_id,
        title: "Case Created",
        body: `${lawyerName} has converted your appointment into an active case`,
        type: "case",
        ref_id: result.insertId,
      });

      // notify admin
      const [admins] = await db.execute(
        "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
      );
      if (admins.length > 0) {
        await createNotification({
          user_id: admins[0].id,
          title: "Case Created",
          body: `${lawyerName} has converted an appointment into a case`,
          type: "account",
          ref_id: result.insertId,
        });
      }
    }

    res.status(201).json({
      message: "Appointment converted to case successfully",
      caseId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, show, byStatus, byClient, myAppointments, create, update, remove, updateStatus, pay, approvePay, convertCase };