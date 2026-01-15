const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(express.json());

const db = require("../db");

/* ---------- SIGNUP ---------- */
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id
    `;

    const result = await db.query(query, [username, hashedPassword]);

    res.json({
      message: "Signup successful",
      userId: result.rows[0].id
    });

  } catch (err) {
    // PostgreSQL duplicate username error
    if (err.code === "23505") {
      return res.status(400).json({ message: "Username already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const query = `
      SELECT id, username, password
      FROM users
      WHERE username = $1
    `;

    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      userId: user.id,
      username: user.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
