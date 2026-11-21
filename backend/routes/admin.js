
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid admin credentials'
      });
    }

    const admin = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      admin.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid admin credentials'
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error.message);

    res.status(500).json({
      message: 'Server error during admin login'
    });
  }
});

const verifyAdmin = require('../middleware/adminAuth');

// View all feedback (Admin only)
router.get('/feedback', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.id,
        s.profile_image,
        s.name AS student_name,
        f.college_name,
        f.department,
        f.admission_year,
        f.agent_name,
        f.overall_rating,
        f.guidance_rating,
        f.communication_rating,
        f.support_rating,
        f.review,
        f.status,
        f.created_at
      FROM feedback f
      JOIN students s ON f.student_id = s.id
      ORDER BY f.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Admin Feedback Error:', error.message);
    res.status(500).json({
      message: 'Unable to fetch feedback'
    });
  }
});

// Delete feedback (Admin only)
router.delete('/feedback/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Feedback not found'
      });
    }

    res.json({
      message: 'Feedback deleted successfully',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Delete Feedback Error:', error.message);

    res.status(500).json({
      message: 'Unable to delete feedback'
    });
  }
});

// Approve or reject feedback
router.patch('/feedback/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be approved or rejected'
      });
    }

    const result = await pool.query(
      `UPDATE feedback
       SET status = $1
       WHERE id = $2
       RETURNING id, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Feedback not found'
      });
    }

    res.json({
      message: `Feedback ${status} successfully`,
      feedback: result.rows[0]
    });

  } catch (error) {
    console.error('Status Update Error:', error.message);
    res.status(500).json({
      message: 'Unable to update feedback status'
    });
  }
});

// Admin Dashboard Statistics
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_feedback,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_feedback,
        COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_feedback,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_feedback
      FROM feedback
    `);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Dashboard Error:', error.message);

    res.status(500).json({
      message: 'Unable to load dashboard statistics'
    });
  }
});

module.exports = router;
