const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");  //  ADD for frgot passwrd
const transporter = require("../config/mailer");  //  ADD for frgot passwrd process

const { 
  findByEmail,
  createUser,
  getAllLawyers,
  getAllClients,
  saveResetToken,
  findByResetToken,
  updatePasswordAndClearToken,
  updateUserProfile,
  saveLicense,
  updateBasicProfile,
  findUserById,
 } = require("../models/userModel"); //  updated

const JWT_SECRET = "your_secret_key";

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email & password required" });

  try {
    const existing = await findByEmail(email);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await createUser(name, email, hash, role);
    const userId = result.insertId;

    // Update phone & location if provided
    const { phone, location } = req.body;
    if (phone || location) {
      await updateBasicProfile(userId, {
        name,
        email,
        phone: phone || null,
        location: location || null,
      });
    }

    // If lawyer, update lawyer specific fields & license path
    if (role === "lawyer") {
      const { specialization, category, experience } = req.body;
      const licensePath = req.file ? req.file.path : null;
      await updateUserProfile(userId, {
        specialization: specialization || null,
        category: category || null,
        location: location || null,
        experience: experience || null,
        cases: null,
        license: licensePath,
      });
    }
    res.status(201).json({ message: "User registered", userId: userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const users = await findByEmail(email);
    if (users.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });
 
      //role based access control, from the users table (lawyer / client / admin)
    const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    role: user.role
  },
  JWT_SECRET,
  { expiresIn: "1d" }
);
   

    res.json({ user, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// get cliemts

async function getClients(req, res) {
  try {
    const clients = await getAllClients();
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// get lawyers

async function getLawyers(req, res) {
  try {
    const lawyers = await getAllLawyers();
    res.status(200).json({ success: true, count: lawyers.length, data: lawyers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /forgot password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email is required" });

    const users = await findByEmail(email);
    if (users.length === 0)
      return res.status(404).json({ error: "No account found with this email" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await saveResetToken(email, token, expiry);

    const resetLink = `http://insaaf.sandbox.pk/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Insaaf Connect" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5c412e;">Reset Your Password</h2>
          <p>You requested a password reset for your Insaaf Connect account.</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #3D2B1F; color: white; 
                    padding: 12px 24px; border-radius: 8px; text-decoration: none; 
                    font-weight: bold; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 12px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /reset password
async function resetPassword(req, res) {
  try {
    const { token, password, confirm_password } = req.body;

    if (!token || !password || !confirm_password)
      return res.status(400).json({ error: "token, password, confirm_password are required" });

    if (password !== confirm_password)
      return res.status(400).json({ error: "Passwords do not match" });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const users = await findByResetToken(token);
    if (users.length === 0)
      return res.status(400).json({ error: "Invalid or expired reset link" });

    const user = users[0];
    const hashed = await bcrypt.hash(password, 10);
    await updatePasswordAndClearToken(user.id, hashed);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /update-profile
// called by lawyer to set their specialization, category, location etc
async function updateProfile(req, res) {
  try {
    const { specialization, category, location, experience, cases, license } = req.body;

    const result = await updateUserProfile(req.user.id, {
      specialization,
      category,
      location,
      experience,
      cases,
      license,
    });
 if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /upload license
// called by lawyer during or after registration
async function uploadLicense(req, res) {
  try {
    // multer puts file info in req.file
    if (!req.file)
      return res.status(400).json({ error: "License file is required" });

    // save file path to DB
    const licensePath = req.file.path;
    await saveLicense(req.user.id, licensePath);

    res.status(201).json({
      message: "License uploaded successfully",
      license: licensePath,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /edit profile
// any user can update their basic profile
async function editProfile(req, res) {
  try {
    const { name, email, phone, location } = req.body;

    if (!name || !email)
      return res.status(400).json({ error: "Name and email are required" });

    const result = await updateBasicProfile(req.user.id, {
      name,
      email,
      phone: phone ?? null,
      location: location ?? null,
    });

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /change password
async function changePassword(req, res) {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // validate all fields present
    if (!current_password || !new_password || !confirm_password)
      return res.status(400).json({
        error: "current_password, new_password, confirm_password are required",
      });

    // check new passwords match
    if (new_password !== confirm_password)
      return res.status(400).json({ error: "New passwords do not match" });

    // check minimum length
    if (new_password.length < 6)
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });

    // get usr from DB
    const users = await findUserById(req.user.id);
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = users[0];

    // verify curent password is correct
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Current password is incorrect" });

    // hash new password and save
    const hashed = await bcrypt.hash(new_password, 10);
    await updatePasswordAndClearToken(user.id, hashed);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
module.exports = { register, login,  getClients, getLawyers, forgotPassword, resetPassword, updateProfile, uploadLicense, editProfile, changePassword }; 