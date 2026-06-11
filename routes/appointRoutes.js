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
   pay,        // ← add
  approvePay, // ← add
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

// ── payment routes ────
router.patch("/:id/pay", authMiddleware, pay);        // PATCH /appointments/1/pay......... client submits pymnt
router.patch("/:id/approve-payment", authMiddleware, approvePay); // PATCH /appointments/1/approve-payment.......lawyr approves pymnt

module.exports = router;
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEsImVtYWlsIjoic2hhaEBnbWFpbC5jb20iLCJpYXQiOjE3ODExOTczMjYsImV4cCI6MTc4MTI4MzcyNn0.Zbhmp7SV6G9cpoq0YSx2hA3uDjdz_6EsBfF7PbALK3s