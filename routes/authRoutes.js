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

//  get all lwyrs and clients 
router.get("/all-lawyers", getLawyers);       // GET /lawyers
router.get("/all-clients", getClients);       // GET /clients

// password reset 
router.post("/forgot-password", forgotPassword);   // POST /forgot password.. email field required for test 
router.post("/reset-password", resetPassword);     // POST /reset password... token, pass, confrm pass are required

module.exports = router;