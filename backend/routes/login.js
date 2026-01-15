const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express.Router();
app.use(cors());
app.use(express.json());

const db = require("../db");

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], err => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Username already exists" });
        }
        return res.status(500).json(err);
      }

      res.json({ message: "Signup successful" });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------- LOGIN ----------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      userId: user.id,
      username: user.username
    });
  });
});

// ---------- SERVER ----------
// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });


module.exports = app;