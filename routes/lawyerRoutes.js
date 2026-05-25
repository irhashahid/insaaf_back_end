const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved,
} = require("../controllers/lawyerController");

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", approved); //get all approved lawyers
router.get("/", index); //get all lawyers
router.get("/:id", show); //get lawyer by id
router.post("/", authMiddleware, create); //create new case
router.put("/:id", authMiddleware, update); //edit case by id 
router.delete("/:id", authMiddleware, remove); //del case
router.patch("/:id/:status", updateStatus); //update case status

module.exports = router;