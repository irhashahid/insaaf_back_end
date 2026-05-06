const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved,
} = require("../controllers/caseControllers");

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", approved);
router.get("/", index);
router.get("/:id", show);
router.post("/", authMiddleware, create);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);
router.patch("/:id/:status", updateStatus);

module.exports = router;