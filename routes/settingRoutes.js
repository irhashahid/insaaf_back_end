const express = require("express");
const router = express.Router();
const { getSettings, updateSetting } = require("../controllers/settingController");
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, roleMiddleware("admin"), updateSetting);

module.exports = router;
