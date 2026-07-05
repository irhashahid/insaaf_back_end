const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getLawyers,       
  getClients,       
  forgotPassword,    
  resetPassword,    
} = require("../controllers/authControllers");

router.post("/register", register);
router.post("/login", login);

// ── get all lwyrs and clients ──
router.get("/lawyers", getLawyers);       // GET /lawyers
router.get("/clients", getClients);       // GET /clients

// ── password reset ──
router.post("/forgot-password", forgotPassword);   // POST /forgot password
router.post("/reset-password", resetPassword);     // POST /reset password

module.exports = router;