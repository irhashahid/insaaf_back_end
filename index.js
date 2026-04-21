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


app.get("/courses", (req, res) => {
  db.query("SELECT * FROM courses", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


app.post("/courses", (req, res) => {
  const { name, description, fee, duration } = req.body;

  const sql =
    "INSERT INTO courses (name, description, fee, duration) VALUES (?,?,?,?)";

  db.query(sql, [name, description, fee, duration], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId });
  });
});


app.put("/courses/:id", (req, res) => {
  const { name, description, fee, duration } = req.body;
  const id = req.params.id;

  const sql =
    "UPDATE courses SET name=?, description=?, fee=?, duration=? WHERE id=?";

  db.query(sql, [name, description, fee, duration, id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Updated" });
  });
});


app.delete("/courses/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM courses WHERE id=?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Deleted" });
  });
});


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});