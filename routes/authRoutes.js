const upload = require("../config/multer");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
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

router.post("/register", register);
router.post("/login", login);

//  get clients 
router.get("/all-clients", getClients);       // GET /clients.. by admin 

// password reset 
router.post("/forgot-password", forgotPassword);   // POST /forgot password.. email field required for test 
router.post("/reset-password", resetPassword);     // POST /reset password... token, pass, confrm pass are reqrd

// for profle updtion
router.put("/update-profile", authMiddleware, updateProfile); // PUT /update profile.. users speicalization etc

// add this route
router.post("/upload-license", authMiddleware, upload.single("license"),  // "license" = field name in form-data
  uploadLicense
);

// edit basic profile ( all users)
router.put("/edit-profile", authMiddleware, editProfile); // PUT /edit profile

// change password 
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;