const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved, renewSubscription, revokeSubscription, SubscriptionStats,
} = require("../controllers/lawyerController");

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", authMiddleware, approved); //get all approved lawyers
router.get("/subscription/stats", authMiddleware, SubscriptionStats);      // GET /lawyers/subscription/stats
router.get("/", authMiddleware, index); //get all lawyers
router.get("/:id", authMiddleware, show); //get lawyer by id
router.post("/", authMiddleware, create); //create new case
router.put("/:id", authMiddleware, update); //edit case by id 
router.delete("/:id", authMiddleware, remove); //del case
//new subsription routes
router.patch("/:id/renew-subscription", authMiddleware, renewSubscription);   // PATCH /lawyers/5/renew-subscription
router.patch("/:id/revoke-subscription", authMiddleware, revokeSubscription); // PATCH /lawyers/5/revoke-subscription
router.patch("/:id/:status", authMiddleware, updateStatus); //update case status

module.exports = router;