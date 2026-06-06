const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, byClient, byLawyer, create,
} = require("../controllers/conversationController");

// specific routes BEFORE /:id
router.get("/client/:clientId", authMiddleware, byClient);   // GET /conversations/client/3
router.get("/lawyer/:lawyerId", authMiddleware, byLawyer);   // GET /conversations/lawyer/5
router.get("/", authMiddleware, index);                      // GET /conversations
router.get("/:id", authMiddleware, show);                    // GET /conversations/1
router.post("/", authMiddleware, create);                    // POST /conversations              // DELETE /conversations/1

module.exports = router;