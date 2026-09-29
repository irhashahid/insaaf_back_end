const { getDB } = require("../config/db");

// GET all notifications for logged-in user
async function getNotificationsByUser(userId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC
     LIMIT 30`,
    [userId]
  );
  return rows;
}

// GET unread count fr the login usr (client+ lwyr)
async function getUnreadCount(userId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return rows[0];
}

// CREATE notftn
async function createNotification({ user_id, title, body, type, ref_id }) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO notifications (user_id, title, body, type, ref_id)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, title, body, type, ref_id ?? null]
  );
  return result;
}

// MARK sngl notfshn as read
async function markNotificationRead(id, userId) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result;
}

// MARK ALL notfctns as read
async function markAllRead(userId, role = null) {
  const db = getDB();
  if (role === "admin") {
    const [result] = await db.execute(
      `UPDATE notifications SET is_read = 1 
       WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE role = 'admin')`,
      [userId]
    );
    return result;
  }
  const [result] = await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [userId]
  );
  return result;
}

// GET all notifications for admin (all relevant types, for all admins)
async function getAllNotifications(adminId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM notifications 
     WHERE user_id = ? OR user_id IN (SELECT id FROM users WHERE role = 'admin')
     ORDER BY created_at DESC
     LIMIT 50`,
    [adminId]
  );
  return rows;
}

// GET unread count for admin
async function getTotalUnreadCount(adminId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS unread FROM notifications 
     WHERE is_read = 0 AND (user_id = ? OR user_id IN (SELECT id FROM users WHERE role = 'admin'))`,
    [adminId]
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