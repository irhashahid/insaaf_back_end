const {
  getAllLawyers,
  getLawyerById,
  createLawyer,
  updateLawyer,
  deleteLawyer,
  setLawyerStatus,
  getApprovedLawyers,
  renewLawyerSubscription,
} = require("../models/lawyerModel");

const { createNotification } = require("../models/notificationModel"); //  ADDED for notify

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

    // ADDED: notify lawyer their approval status changed
    await createNotification({
      user_id: req.params.id,
      title: `Account ${req.params.status}`,
      body: `Your lawyer account has been ${req.params.status.toLowerCase()} by admin`,
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
    res.json(await getApprovedLawyers(req.params.searchQuery));
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

    res.json({ message: "Subscription renewed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function getSubscriptionStats(req, res) {
  try {
    const stats = await require("../models/lawyerModel").getSubscriptionStats();
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
    const { revokeLawyerSubscription } = require("../models/lawyerModel");
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

module.exports = { index, show, create, update, remove, updateStatus, approved, renewSubscription, revokeSubscription, getSubscriptionStats };