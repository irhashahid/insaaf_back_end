const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findByEmail, createUser, getAllLawyers, getAllClients } = require("../models/userModel"); //  updated

const JWT_SECRET = "your_secret_key";

async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email & password required" });

  try {
    const existing = await findByEmail(email);
    if (existing.length > 0)
      return res.status(409).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await createUser(email, hash);

    res.status(201).json({ message: "User registered", userId: result.insertId });
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

// get lawyrs and cliemts
async function getLawyers(req, res) {
  try {
    const lawyers = await getAllLawyers();
    res.status(200).json({ success: true, count: lawyers.length, data: lawyers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getClients(req, res) {
  try {
    const clients = await getAllClients();
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, getLawyers, getClients }; 