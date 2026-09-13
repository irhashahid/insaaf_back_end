const {
  getAllLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  setLawyerStatus,
  getApprovedLawyers,
  renewLawyerSubscription,
  submitSubscriptionPayment,
  revokeLawyerSubscription,
  getSubscriptionStats,
  getSubscriptionRecords,
} = require("../models/lawyerModel");

const { createNotification } = require("../models/notificationModel"); //  ADDED for notify
const { getDB } = require("../config/db");
async function index(req, res) {
  try {
    res.json(await getAllLawyers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function show(req, res) {
  try {
    const rows = await getLawyerById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const result = await createLawyer(req.body, req.user.id);
    res.status(201).json({ message: "Lawyer created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    if (req.user.role === 'lawyer' && parseInt(req.user.id) !== parseInt(req.params.id)) {
      return res.status(403).json({ error: "Not authorized to update this profile" });
    }
    const result = await updateLawyer(req.body, req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const result = await deleteLawyer(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
     const result = await setLawyerStatus(req.params.id, req.params.status);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Lawyer not found" });

    const statusLabel = req.params.status == 1 ? "Approved" : "Rejected";
    // ADDED: notify lawyer their approval status changed
    await createNotification({
      user_id: req.params.id,
      title: `Account ${statusLabel}`,
      body: `Your lawyer account has been ${statusLabel.toLowerCase()} by admin`,
      type: "account",
      ref_id: null,
    });

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function approved(req, res) {
  try {
    res.json(await getApprovedLawyers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function renewSubscription(req, res) {
  try {
    const result = await renewLawyerSubscription(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Lawyer not found" });

    // notify lawyer their subscription was renewed
    await createNotification({
      user_id: req.params.id,
      title: "Subscription Renewed",
      body: "Your lawyer account subscription has been extended by 30 days.",
      type: "account",
      ref_id: null,
    });
    const db = getDB();
    const [admins] = await db.execute(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (admins.length > 0) {
      //get alwywer nae
      const [lawyer] = await db.execute(
        "SELECT name FROM users WHERE id = ?",
        [req.params.id]
      );
      const lawyerName = lawyer[0]?.name ?? "A lawyer";

      await createNotification({
        user_id: admins[0].id,
        title: "Subscription Payment Received",
        body: `${lawyerName} has renewed their subscription for 30 days`,
        type: "account",
        ref_id: parseInt(req.params.id),
      });
    }

    res.json({ message: "Subscription renewed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function SubscriptionStats(req, res) {
  try {
    const stats = await getSubscriptionStats(); // this now callss the model fntion
    const totalRevenue = stats.activeCount * stats.subscriptionFee;
    res.json({
      activeCount: stats.activeCount,
      expiredCount: stats.expiredCount,
      totalRevenue,
      fee: stats.subscriptionFee,
      lawyers: stats.lawyers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function revokeSubscription(req, res) {
  try {
    const result = await revokeLawyerSubscription(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Lawyer not found" });

    await createNotification({
      user_id: req.params.id,
      title: "Subscription Revoked",
      body: "Your lawyer account subscription has been revoked by admin.",
      type: "account",
      ref_id: null,
    });

    res.json({ message: "Subscription revoked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function subscriptionRecords(req, res) {
  try {
    const records = await getSubscriptionRecords();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function submitSubscription(req, res) {
  try {
    const { transaction_id, payment_receipt, payment_method } = req.body;

    // Get fee from settings
    const db = getDB();
    let fee = 2000;
    try {
      const [settings] = await db.execute(
        "SELECT setting_value FROM settings WHERE setting_key = 'subscription_fee'"
      );
      if (settings.length > 0) fee = parseFloat(settings[0].setting_value) || 2000;
    } catch (e) {}

    const result = await submitSubscriptionPayment(req.user.id, {
      amount: fee,
      payment_method: payment_method || 'JazzCash',
      transaction_id,
      payment_receipt,
    });

    // Notify all admins
    try {
      const [adminRows] = await db.execute(
        "SELECT id FROM users WHERE role = 'admin'"
      );
      const [lawyerRows] = await db.execute(
        "SELECT name FROM users WHERE id = ?",
        [req.user.id]
      );
      const lawyerName = lawyerRows[0]?.name ?? "A lawyer";

      for (const admin of adminRows) {
        await createNotification({
          user_id: admin.id,
          title: "Subscription Payment Submitted",
          body: `${lawyerName} has submitted subscription payment proof for review`,
          type: "account",
          ref_id: result.insertId,
        });
      }
    } catch (notifErr) {
      console.warn("Could not dispatch notification to admin:", notifErr.message);
    }

    res.status(201).json({
      message: "Subscription payment proof submitted successfully. Waiting for admin approval.",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { 
  index, 
  show, 
  create, 
  update, 
  remove, 
  updateStatus, 
  approved, 
  renewSubscription, 
  revokeSubscription, 
  SubscriptionStats,
  subscriptionRecords,
  submitSubscription
};