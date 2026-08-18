const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  index,
  show,
  byStatus,
  byClient,
  myAppointments, // for role based access
  create,
  update,
  remove,
  updateStatus,
  pay,        //  add
  approvePay, // add
  convertCase,
} = require("../controllers/appointControllers");

// ── specific routes BEFORE /:id ──
router.get("/filter", authMiddleware, byStatus);               // GET /appointments/filter?status=pending
router.get("/client/:clientId", authMiddleware, roleMiddleware('admin'), byClient);     // GET /appointments/client/3
router.get("/mine", authMiddleware, myAppointments); // GET /appointments/mine


// ── general CRUD ──
router.get("/", authMiddleware, roleMiddleware('admin'), index);                        // GET /appointments
router.get("/:id", authMiddleware, show);                      // GET /appointments/1 
router.post("/", authMiddleware, create);      // POST /appointments
router.put("/:id", authMiddleware, update);    // PUT /appointments/1
router.delete("/:id", authMiddleware, roleMiddleware('admin'), remove); // DELETE /appointments/4

// ── status control (Figma buttons) ────
router.patch("/:id/status/:status", authMiddleware, roleMiddleware('admin', 'lawyer'), updateStatus); // PATCH /appointments/1/accepted

// ── payment routes ────
router.patch("/:id/pay", authMiddleware, pay);        // PATCH /appointments/1/pay......... client submits pymnt
router.patch("/:id/approve-payment", authMiddleware, roleMiddleware('admin', 'lawyer'), approvePay); // PATCH /appointments/1/approve-payment.......lawyr approves pymnt

// ── conversion route ────
router.post("/:id/convert-to-case", authMiddleware, roleMiddleware('admin', 'lawyer'), convertCase); // POST /appointments/1/convert-to-case........lawyer converts approved appointment into a case

module.exports = router;
