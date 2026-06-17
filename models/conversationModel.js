const { getDB } = require("../config/db");

// GET all conversations
async function getAllConversations() {
  const db = getDB();
  const [rows] = await db.execute("SELECT * FROM conversation");
  return rows;
}

// GET single conversation by id
async function getConversationById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM conversation WHERE id = ?",
    [id]
  );
  return rows;
}

// GET conversations by client_id
async function getConversationsByClient(clientId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM conversation WHERE client_id = ?",
    [clientId]
  );
  return rows;
}

// GET conversations by lawyer_id
async function getConversationsByLawyer(lawyerId) {
  const db = getDB();
  const [rows] = await db.execute(
    "SELECT * FROM conversation WHERE lawyer_id = ?",
    [lawyerId]
  );
  return rows;
}

// CREATE conversation
async function createConversation(clientId, lawyerId) {
  const db = getDB();

  const [existing] = await db.execute(
    "SELECT * FROM conversation WHERE client_id=? AND lawyer_id=?",
    [clientId, lawyerId]
  );

  if (existing.length > 0) {
    return {
      insertId: existing[0].id
    };
  }

  const [result] = await db.execute(
    "INSERT INTO conversation (client_id, lawyer_id) VALUES (?, ?)",
    [clientId, lawyerId]
  );

  return result;
}
// GET conversations for logged-in user (whether client or lawyer)
async function getConversationsByUser(userId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT c.*, 
      client.name AS client_name,
      lawyer.name AS lawyer_name
     FROM conversation c
     JOIN users client ON c.client_id = client.id
     JOIN users lawyer ON c.lawyer_id = lawyer.id
     WHERE c.client_id = ? OR c.lawyer_id = ?
     ORDER BY c.created_at DESC`,
    [userId, userId]
  );
  return rows;
}

module.exports = {
  getAllConversations,
  getConversationById,
  getConversationsByClient,
  getConversationsByLawyer,
  createConversation,
  getConversationsByUser,
};