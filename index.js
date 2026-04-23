const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "your_secret_key";

// ─────────────────────────────────────────
// DB CONNECTION
// ─────────────────────────────────────────
let db;

async function initDB() {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "insaaf_connect",
    });
    console.log("MySQL Connected");
  } catch (err) {
    console.error("DB Error:", err);
  }
}

initDB();

// ─────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
app.post("/register", async (req, res) => {
  console.log('check 1');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email & password required" });
  }
  console.log('check 2');

  try {
    console.log('check 3');
    const [existing] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }
  console.log('check 4');


    const hash = await bcrypt.hash(password, 10);
decodeURI()
    const [result] = await db.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hash]
    );

    res.status(201).json({
      message: "User registered",
      userId: result.insertId,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
app.post("/login", async (req, res) => {
  console.log('check 1');
  const { email, password } = req.body;

  try {
  console.log('check 2');

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log('check 3');

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('check 4');

    if (!isatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    )
  console.log('check 5');


    res.json({
      user: user,
      message: "Login successful",
      token,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET ALL LAWYERS (PUBLIC)
// ─────────────────────────────────────────
app.get("/lawyers", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET SINGLE LAWYER
// ─────────────────────────────────────────
app.get("/lawyers/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM lawyers WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// CREATE LAWYER (PROTECTED)
// ─────────────────────────────────────────
app.post("/lawyers", authMiddleware, async (req, res) => {
  const { name, specialization, location, experience, cases } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO lawyers 
       (name, specialization, location, experience, cases, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, specialization, location, experience, cases, req.user.id]
    );

    res.status(201).json({
      message: "Lawyer created",
      id: result.insertId,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// UPDATE LAWYER
// ─────────────────────────────────────────
app.put("/lawyers/:id", authMiddleware, async (req, res) => {
  const { name, specialization, location, experience, cases } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE lawyers 
       SET name=?, specialization=?, location=?, experience=?, cases=?
       WHERE id=? AND user_id=?`,
      [
        name,
        specialization,
        location,
        experience,
        cases,
        req.params.id,
        req.user.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found or not yours" });
    }

    res.json({ message: "Updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// DELETE LAWYER
// ─────────────────────────────────────────
app.delete("/lawyers/:id", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM lawyers WHERE id=? AND user_id=?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found or not yours" });
    }

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});