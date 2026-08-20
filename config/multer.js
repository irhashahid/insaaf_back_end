const multer = require("multer");
const path = require("path");

const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = "uploads/licenses/";
    if (file.fieldname === "profile_pic") {
      dir = "uploads/profiles/";
    }
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === "profile_pic" ? "profile" : "license";
    const uniqueName = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, PNG files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;