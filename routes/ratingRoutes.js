const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { byLawyer, create, remove } = require("../controllers/ratingController");

// specific routes BEFORE /:id
router.get("/lawyer/:lawyerId", byLawyer);              // GET /ratings/lawyer/3
router.post("/", authMiddleware, create);               // POST /ratings
router.delete("/:id", authMiddleware, remove);          // DELETE /ratings/1

module.exports = router;