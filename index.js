const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// db connct
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",     
  database: "insaaf_connect",
});

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// 1. REGISTER
// ─────────────────────────────────────────
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
console.log('check.1')

  // Check if email already exists
  const checkSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.log('check.2')

    // Insert new user
    const insertSql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(insertSql, [email, password], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'User registered successfully',
        userId: result.insertId,
      });
    });
  });
});

// ─────────────────────────────────────────
// 2. LOGIN
// ─────────────────────────────────────────
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
});

// 1. GET ALL LAWYERS
// ─────────────────────────────────────────
app.get('/lawyers', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ─────────────────────────────────────────
// 2. GET SINGLE LAWYER
// ─────────────────────────────────────────
app.get('/lawyers/:id', (req, res) => {
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Lawyer not found' });
    res.json(results[0]);
  });
});

// ─────────────────────────────────────────
// 3. CREATE LAWYER (POST)
// ─────────────────────────────────────────
app.post('/lawyers', (req, res) => {
  const { name, specialization, location, experience, cases } = req.body;

  if (!name || !specialization || !location || !experience || !cases) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO users (name, specialization, location, experience, cases) VALUES (?, ?, ?, ?, ?)';
  const values = [name, specialization, location, experience, cases];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Lawyer added successfully',
      lawyerId: result.insertId,
    });
  });
});

// ─────────────────────────────────────────
// 4. UPDATE LAWYER (PUT)
// ─────────────────────────────────────────
app.put('/lawyers/:id', (req, res) => {
  const { name, specialization, location, experience, cases } = req.body;

  const sql = `
    UPDATE users
    
  `;
  const values = [name, specialization, location, experience, cases, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Lawyer not found' });
    res.json({ message: 'Lawyer updated successfully' });
  });
});

// ─────────────────────────────────────────
// 5. DELETE LAWYER (DELETE)
// ─────────────────────────────────────────
app.delete('/lawyers/:id', (req, res) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Lawyer not found' });
    res.json({ message: 'Lawyer deleted successfully' });
  });
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});