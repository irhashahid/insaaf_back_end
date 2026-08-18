const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  index, show, create, update, remove, updateStatus, approved, myCases,
} = require("../controllers/caseControllers");
const { getLawyers, getClients } = require("../controllers/authControllers"); //  new

// NOTE: '/approved' must come BEFORE '/:id' to avoid route conflict
router.get("/mine", authMiddleware, myCases);  // GET /cases/mine........ role based API
router.get("/approved", authMiddleware, approved); //get krne approved cases
router.get("/lawyers", authMiddleware, roleMiddleware('admin'), getLawyers);      //  get all lawyers
router.get("/clients", authMiddleware, roleMiddleware('admin'), getClients);      // get all clients
router.get("/", authMiddleware, roleMiddleware('admin'), index); // is sey sb case ayeingy 
router.get("/:id", authMiddleware, show); // bs single case ayeeiga
router.post("/",authMiddleware, roleMiddleware('admin'), create); // create new case
router.put("/:id", authMiddleware, roleMiddleware('admin'), update); //edit case by id
router.delete("/:id", authMiddleware, roleMiddleware('admin'), remove); //del case by id
router.patch("/:id/status/:status", authMiddleware, updateStatus); //update Case status (pending, approved, rejected)

module.exports = router;