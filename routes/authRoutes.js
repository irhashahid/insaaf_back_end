const upload = require("../config/multer");
const express = require("express");
const router = express.Router();
const authMiddleware  = require("../middleware/authMiddleware");
const {
  register,
  login,
  getClients,
  forgotPassword,
  resetPassword,
  updateProfile,
  uploadLicense,
  editProfile,
  changePassword,
} = require("../controllers/authControllers");

//  authntiction
router.post("/register", upload.single("license"), register); // ← only this one
router.post("/login", login);

// get cleints 
router.get("/all-clients", getClients);

// reset pass 
router.post("/forgot-password", forgotPassword); //email field reqred fr test
router.post("/reset-password", resetPassword); //... token, pass, confrm pass are reqrd

// fr profile 
router.put("/update-profile", authMiddleware, updateProfile);
router.put("/edit-profile", authMiddleware, editProfile);
router.put("/change-password", authMiddleware, changePassword);

//  license upload 
router.post("/upload-license", authMiddleware, upload.single("license"), uploadLicense);

module.exports = router;