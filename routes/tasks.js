// routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Create Task
router.post('/', async (req, res) => {
  const { title, description, status = 'pending' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const [result] = await db.execute(
      'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)',
      [title, description || null, status]
    );
    res.status(201).json({ id: result.insertId, title, description, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get All Tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update Task Status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete Task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;