const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  setCaseStatus,
  getApprovedCases,
  getCasesByClient,  //  add for role 
  getCasesByLawyer,  //  add for role
  getAdminStats,  //  admin dashboard 
  getLawyerStats, //  lawyer dashboard
} = require("../models/caseModel");

const { createNotification } = require("../models/notificationModel");
const { getDB } = require("../config/db");

async function index(req, res) {
  try {
    res.json(await getAllCases());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function show(req, res) {
  try {
    const rows = await getCaseById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const result = await createCase(req.body, req.user.id);
    res.status(201).json({ message: "Case created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const result = await updateCase(req.body, req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const result = await deleteCase(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const allowed = ["pending", "approved", "rejected", "hearing", "closed"];
    const status = req.params.status.toLowerCase();

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await setCaseStatus(req.params.id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Case not found" });
    }

    // notify client about case status change
    try {
      const db = getDB();
      const [caseRows] = await db.execute(
        "SELECT client_id, lawyer_id FROM cases WHERE id = ?",
        [req.params.id]
      );

      if (caseRows.length > 0) {
        // fetch lawyer name first
        const [lawyerRows] = await db.execute(
          "SELECT name FROM users WHERE id = ?",
          [caseRows[0].lawyer_id]
        );
        const lawyerName = lawyerRows[0]?.name ?? "Your lawyer";

        // notify client
        await createNotification({
          user_id: caseRows[0].client_id,
          title: "Case Status Updated",
          body: `${lawyerName} has updated your case status to ${status}`,
          type: "case",
          ref_id: parseInt(req.params.id),
        });

        // notify admin
        const [admins] = await db.execute(
          "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        );
        if (admins.length > 0) {
          await createNotification({
            user_id: admins[0].id,
            title: "Case Status Updated",
            body: `${lawyerName} updated a case status to ${status}`,
            type: "case",
            ref_id: parseInt(req.params.id),
          });
        }
      }
    } catch (notifErr) {
      console.warn("Could not send case status notification:", notifErr.message);
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function approved(req, res) {
  try {
    res.json(await getApprovedCases());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /cases/mine  — role-based
// client → their own cases (by client_id)
// lawyer → assigned cases (by lawyer_id)
// admin  → all cases
async function myCases(req, res) {
  try {
    const { id, role } = req.user;

    let rows;
    if (role === "admin") {
      rows = await getAllCases();
    } else if (role === "lawyer") {
      rows = await getCasesByLawyer(id);
    } else {
      // default: client
      rows = await getCasesByClient(id);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// GET /cases/admin-stats    ..admin dashboard monthly stats
async function adminStats(req, res) {
  try {
    res.json(await getAdminStats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /cases/lawyer-stats   ..lawyer dashboard monthly stats
async function lawyerStats(req, res) {
  try {
    res.json(await getLawyerStats(req.user.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, show, create, update, remove, updateStatus, approved, myCases, adminStats, lawyerStats };