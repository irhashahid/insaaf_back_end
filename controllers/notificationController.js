const {
  getNotificationsByUser,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  getAllNotifications,
  getTotalUnreadCount,  
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
// GET /notifications/mine - role based wrk

async function myNotifications(req, res) {
  try {
    const { id, role } = req.user;

    let notifications;
    let unread;

    if (role === "admin") {
      notifications = await getAllNotifications();
      const count = await getTotalUnreadCount();
      unread = count.unread;
    } else {
// client and lawyer both get only their own
      notifications = await getNotificationsByUser(id);
      const count = await getUnreadCount(id);
      unread = count.unread;
    }

    res.json({ unread, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, markRead, markAllAsRead, myNotifications };