const express = require("express");
const db = require("../db");

const router = express.Router();

/* ---------- CREATE TODO ---------- */
router.post("/", (req, res) => {
  const { userId, title, endDate } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ message: "userId and title required" });
  }

  const sql =
    "INSERT INTO todos (user_id, title, end_date) VALUES (?, ?, ?)";

  db.query(sql, [userId, title, endDate || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Todo added", id: result.insertId });
  });
});

/* ---------- READ TODOS ---------- */
router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      id,
      user_id,
      title,
      is_completed,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date
    FROM todos
    WHERE user_id = ?
    ORDER BY end_date ASC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ---------- UPDATE TODO (EDIT) ---------- */
router.put("/:id", (req, res) => {
  const { title, endDate } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Title required" });
  }

  const sql =
    "UPDATE todos SET title = ?, end_date = ? WHERE id = ?";

  db.query(sql, [title, endDate || null, id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Todo updated" });
  });
});

/* ---------- COMPLETE / UNCOMPLETE ---------- */
router.put("/:id/complete", (req, res) => {
  const { is_completed } = req.body;
  const { id } = req.params;

  const sql =
    "UPDATE todos SET is_completed = ? WHERE id = ?";

  db.query(sql, [is_completed, id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Todo status updated" });
  });
});

/* ---------- DELETE ---------- */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM todos WHERE id = ?";

  db.query(sql, [id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Todo deleted" });
  });
});

module.exports = router;
