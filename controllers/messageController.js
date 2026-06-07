const {
  getMessagesByConversation,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
} = require("../models/messageModel");

// GET /messages/conversation/:conversationId
async function byConversation(req, res) {
  try {
    res.json(await getMessagesByConversation(req.params.conversationId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /messages/:id
async function show(req, res) {
  try {
    const rows = await getMessageById(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ error: "Message not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /messages
// body: { conversation_id, receiver_id, message }
async function create(req, res) {
  try {
    const { conversation_id, receiver_id, message } = req.body;

    if (!conversation_id || !receiver_id || !message)
      return res.status(400).json({ error: "conversation_id, receiver_id, message are required" });

    const result = await createMessage({
      conversation_id,
      sender_id: req.user.id,   // from JWT token
      receiver_id,
      message,
    });
    res.status(201).json({ message: "Message sent", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /messages/:id
// body: { message }
async function update(req, res) {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ error: "message text is required" });

    const result = await updateMessage(req.params.id, message, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Message updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /messages/:id
async function remove(req, res) {
  try {
    const result = await deleteMessage(req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /messages/read/:conversationId
async function markRead(req, res) {
  try {
    await markAsRead(req.params.conversationId, req.user.id);
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { byConversation, show, create, update, remove, markRead };