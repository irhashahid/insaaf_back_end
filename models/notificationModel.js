const { getDB } = require("../config/db");

// GET all notifications for logged-in user
async function getNotificationsByUser(userId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

// GET unread count for logged-in user
async function getUnreadCount(userId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return rows[0];
}

// CREATE notification — called internally from other controllers
async function createNotification({ user_id, title, body, type, ref_id }) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO notifications (user_id, title, body, type, ref_id)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, title, body, type, ref_id ?? null]
  );
  return result;
}

// MARK single notification as read
async function markNotificationRead(id, userId) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result;
}

// MARK ALL notifications as read
async function markAllRead(userId) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId]
  );
  return result;
}

// GET all notifications (for admin)
async function getAllNotifications() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM notifications ORDER BY created_at DESC"
  );
  return rows;
}
  // GET unread count for admin (all)
async function getTotalUnreadCount() {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS unread FROM notifications WHERE is_read = 0"
  );
  return rows[0];
}

module.exports = {
  getNotificationsByUser,
  getUnreadCount,
  createNotification,
  markNotificationRead,
  markAllRead,
  getAllNotifications,   
  getTotalUnreadCount,   
};