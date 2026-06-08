const { getDB } = require("../config/db");

// GET all messages in a conversation
async function getMessagesByConversation(conversationId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    [conversationId]
  );
  return rows;
}

// GET single message by id
async function getMessageById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM messages WHERE id = ?",
    [id]
  );
  return rows;
}

// CREATE message
// matches: conversation_id, sender_id, receiver_id, message
async function createMessage({ conversation_id, sender_id, receiver_id, message }) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO messages (conversation_id, sender_id, receiver_id, message, is_read)
     VALUES (?, ?, ?, ?, 0)`,
    [conversation_id, sender_id, receiver_id, message]
  );
  return result;
}

// MARK messages as read
// matches: is_read column
async function markAsRead(conversationId, receiverId) {
  const db = getDB();
  const [result] = await db.execute(
    "UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND receiver_id = ?",
    [conversationId, receiverId]
  );
  return result;
}

module.exports = {
  getMessagesByConversation,
  getMessageById,
  createMessage,
  markAsRead,
};