const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved, renewSubscription, getSubscriptionStats
} = require("../controllers/lawyerController");

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", authMiddleware, approved); //get all approved lawyers
router.get("/subscription-stats", authMiddleware, roleMiddleware('admin'), getSubscriptionStats);
router.get("/", authMiddleware, roleMiddleware('admin'), index); //get all lawyers
router.get("/:id", authMiddleware, show); //get lawyer by id
router.post("/", authMiddleware, roleMiddleware('admin'), create); //create new case
router.put("/:id", authMiddleware, roleMiddleware('admin', 'lawyer'), update); //edit case by id 
router.delete("/:id", authMiddleware, roleMiddleware('admin'), remove); //del case
router.patch("/:id/renew", authMiddleware, roleMiddleware('admin'), renewSubscription); //renew subscription
router.patch("/:id/:status", authMiddleware, roleMiddleware('admin'), updateStatus); //update case status

module.exports = router;