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
  const [result] = await db.execute(
    "INSERT INTO conversation (client_id, lawyer_id) VALUES (?, ?)",
    [clientId, lawyerId]
  );
  return result;
}

// DELETE conversation
async function deleteConversation(id) {
  const db = getDB();
  const [result] = await db.execute(
    "DELETE FROM conversation WHERE id = ?",
    [id]
  );
  return result;
}

module.exports = {
  getAllConversations,
  getConversationById,
  getConversationsByClient,
  getConversationsByLawyer,
  createConversation,
  deleteConversation,
};