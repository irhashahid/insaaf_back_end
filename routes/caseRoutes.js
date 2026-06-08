const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved,
} = require("../controllers/caseControllers");
const { getLawyers, getClients } = require("../controllers/authControllers"); //  new

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/approved", approved); //get krne approved cases
router.get("/lawyers", getLawyers);      //  get all lawyers
router.get("/clients", getClients);      // get all clients
router.get("/", index); // is sey sb case ayeingy 
router.get("/:id", show); // bs single case ayeeiga
router.post("/",authMiddleware, create); // create new case
router.put("/:id", authMiddleware, update); //edit case by id
router.delete("/:id", authMiddleware, remove); //del case by id
router.patch("/:id/status/:status", updateStatus); //update Case status (pending, approved, rejected)

module.exports = router;