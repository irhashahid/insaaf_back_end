const {
  getNotificationsByUser,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
} = require("../models/notificationModel");

// GET /notifications
async function index(req, res) {
  try {
    const notifications = await getNotificationsByUser(req.user.id);
    const { unread } = await getUnreadCount(req.user.id);
    res.json({ unread, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /notifications/:id/read
async function markRead(req, res) {
  try {
    const result = await markNotificationRead(req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /notifications/read-all
async function markAllAsRead(req, res) {
  try {
    await markAllRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, markRead, markAllAsRead };