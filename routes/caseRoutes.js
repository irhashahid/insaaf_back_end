const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  setCaseStatus,
  getApprovedCases,
} = require("../models/caseModel");

async function index(req, res) {
  try {
    res.json(await getAllCases());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function show(req, res) {
  try {
    const rows = await getCaseById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function create(req, res) {
  try {
    const result = await createCase(req.body, req.user.id);
    res.status(201).json({ message: "Case created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const result = await updateCase(req.body, req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const result = await deleteCase(req.params.id, req.user.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const result = await setCaseStatus(req.params.id, req.params.status);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Case not found" });
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function approved(req, res) {
  try {
    res.json(await getApprovedCases());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { index, show, create, update, remove, updateStatus, approved };