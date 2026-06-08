const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index,
  show,
  byStatus,
  byClient,
  create,
  update,
  remove,
  updateStatus,
} = require("../controllers/appointControllers");

// ── specific routes BEFORE /:id ──
router.get("/filter", byStatus);               // GET /appointments/filter?status=pending
router.get("/client/:clientId", byClient);     // GET /appointments/client/3

// ── general CRUD ──
router.get("/", index);                        // GET /appointments
router.get("/:id", show);                      // GET /appointments/1 
router.post("/", authMiddleware, create);      // POST /appointments
router.put("/:id", authMiddleware, update);    // PUT /appointments/1
router.delete("/:id", authMiddleware, remove); // DELETE /appointments/4

// ── status control (Figma buttons) ────
router.patch("/:id/status/:status", authMiddleware, updateStatus); // PATCH /appointments/1/accepted

module.exports = router;