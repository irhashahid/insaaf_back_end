const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  byConversation, show, create, markRead,
} = require("../controllers/messageController");

// specific routes BEFORE /:id

router.get("/conversation/:conversationId", authMiddleware, byConversation); // GET /messages/conversation/1
router.patch("/read/:conversationId", authMiddleware, markRead);             // PATCH /messages/read/1
router.get("/:id", authMiddleware, show);                                    // GET /messages/5
router.post("/", authMiddleware, create);                                    // POST /messages                              // DELETE /messages/5

module.exports = router;
