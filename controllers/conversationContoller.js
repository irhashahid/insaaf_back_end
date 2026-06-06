const {
  getAllConversations,
  getConversationById,
  getConversationsByClient,
  getConversationsByLawyer,
  createConversation,
  
} = require("../models/conversationModel");

// GET /conversations
async function index(req, res) {
  try {
    res.json(await getAllConversations());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /conversations/:id
async function show(req, res) {
  try {
    const rows = await getConversationById(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ error: "Conversation not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /conversations/client/:clientId
async function byClient(req, res) {
  try {
    res.json(await getConversationsByClient(req.params.clientId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /conversations/lawyer/:lawyerId
async function byLawyer(req, res) {
  try {
    res.json(await getConversationsByLawyer(req.params.lawyerId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /conversations
// body: { lawyer_id }
async function create(req, res) {
  try {
    const { lawyer_id } = req.body;
    if (!lawyer_id)
      return res.status(400).json({ error: "lawyer_id is required" });

    const result = await createConversation(req.user.id, lawyer_id);
    res.status(201).json({ message: "Conversation created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


module.exports = { index, show, byClient, byLawyer, create };