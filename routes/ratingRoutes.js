const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { byLawyer, create, remove } = require("../controllers/ratingController");

// specific routes BEFORE /:id
router.get("/lawyer/:lawyerId", byLawyer);              // GET /ratings/lawyer/3
router.post("/", authMiddleware, create);               // POST /ratings...........api for client... rating bs postman pe add krni nd not in db 
router.delete("/:id", authMiddleware, remove);          // DELETE /ratings/1......id mein jo rating table ki id hai woh hit krni na k client kii id 

module.exports = router;