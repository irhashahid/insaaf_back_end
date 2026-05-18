const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved,
} = require("../controllers/caseControllers");

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", approved); //get krne approved cases
router.get("/", index); // is sey sb case ayeingy 
router.get("/:id", show); // bs single case ayeeiga
router.post("/", authMiddleware, create); 
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);
router.patch("/:id/status/:status", updateStatus);

module.exports = router;