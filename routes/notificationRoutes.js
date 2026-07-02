const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { index, markRead, markAllAsRead, myNotifications, 
    } = require("../controllers/notificationController");

// specific routes BEFORE /:id
router.get("/mine", authMiddleware, myNotifications);
router.get("/", authMiddleware, index);                   // GET /notifications
router.patch("/read-all", authMiddleware, markAllAsRead); // PATCH /notifications/read-all
router.patch("/:id/read", authMiddleware, markRead);      // PATCH /notifications/5/read.....hve to put the noti table id not the user-id
 
module.exports = router;