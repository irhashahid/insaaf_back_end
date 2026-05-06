const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, createCase, updateCase, deleteCase, setCaseStatus, getApprovedCases,
} = require("../controllers/caseControllers");

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", getApprovedCases);
router.get("/", index);
router.get("/:id", show);
router.post("/", authMiddleware, createCase);
router.put("/:id", authMiddleware, updateCase);
router.delete("/:id", authMiddleware, deleteCase);
router.patch("/:id/:status", setCaseStatus);

module.exports = router;