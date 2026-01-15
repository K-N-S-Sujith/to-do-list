const express = require("express");
const db = require("../db");

const router = express.Router();

/* ---------- CREATE TODO ---------- */
router.post("/", async (req, res) => {
  const { userId, title, endDate } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ message: "userId and title required" });
  }

  try {
    const query = `
      INSERT INTO todos (user_id, title, end_date)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    const result = await db.query(query, [
      userId,
      title,
      endDate || null
    ]);

    res.json({
      message: "Todo added",
      id: result.rows[0].id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- READ TODOS ---------- */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
        id,
        user_id,
        title,
        is_completed,
        TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date
      FROM todos
      WHERE user_id = $1
      ORDER BY end_date ASC
    `;

    const result = await db.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- UPDATE TODO (EDIT) ---------- */
router.put("/:id", async (req, res) => {
  const { title, endDate } = req.body;
  const { id } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Title required" });
  }

  try {
    const query = `
      UPDATE todos
      SET title = $1, end_date = $2
      WHERE id = $3
    `;

    await db.query(query, [
      title,
      endDate || null,
      id
    ]);

    res.json({ message: "Todo updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- COMPLETE / UNCOMPLETE ---------- */
router.put("/:id/complete", async (req, res) => {
  const { is_completed } = req.body;
  const { id } = req.params;

  try {
    const query = `
      UPDATE todos
      SET is_completed = $1
      WHERE id = $2
    `;

    await db.query(query, [is_completed, id]);
    res.json({ message: "Todo status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- DELETE ---------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM todos WHERE id = $1`;
    await db.query(query, [id]);

    res.json({ message: "Todo deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
