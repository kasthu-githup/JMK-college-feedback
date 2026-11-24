
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const verifyAdmin = require('../middleware/adminAuth');

// ADMIN LOGIN
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

// VIEW ALL THREE CATEGORIES
router.get('/feedback', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.id,
        'college'::text AS category,
        f.student_id,
        s.profile_image,
        s.name AS student_name,
        f.college_name AS primary_title,
        f.department AS secondary_title,
        f.admission_year::text AS detail_one,
        f.agent_name AS detail_two,
        f.overall_rating,
        f.guidance_rating,
        f.communication_rating,
        f.support_rating,
        f.review,
        f.video_url,
        f.status,
        f.created_at
      FROM feedback f
      LEFT JOIN students s ON f.student_id = s.id

      UNION ALL

      SELECT
        f.id,
        'internship'::text AS category,
        f.student_id,
        s.profile_image,
        s.name AS student_name,
        f.company_name AS primary_title,
        f.job_role AS secondary_title,
        f.duration AS detail_one,
        f.stipend AS detail_two,
        f.overall_rating,
        NULL::integer AS guidance_rating,
        NULL::integer AS communication_rating,
        NULL::integer AS support_rating,
        f.review,
        f.video_url,
        NULL::varchar AS status,
        f.created_at
      FROM internship_feedback f
      LEFT JOIN students s ON f.student_id = s.id

      UNION ALL

      SELECT
        f.id,
        'project'::text AS category,
        f.student_id,
        s.profile_image,
        s.name AS student_name,
        f.project_title AS primary_title,
        f.domain AS secondary_title,
        f.technologies AS detail_one,
        f.guide_name AS detail_two,
        f.overall_rating,
        NULL::integer AS guidance_rating,
        NULL::integer AS communication_rating,
        NULL::integer AS support_rating,
        f.review,
        f.video_url,
        NULL::varchar AS status,
        f.created_at
      FROM project_feedback f
      LEFT JOIN students s ON f.student_id = s.id

      ORDER BY created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Admin Feedback Error:', error.message);
    res.status(500).json({
      message: 'Unable to fetch feedback'
    });
  }
});

// DELETE FEEDBACK BY CATEGORY
router.delete('/feedback/:category/:id', verifyAdmin, async (req, res) => {
  try {
    const { category, id } = req.params;

    const tables = {
      college: 'feedback',
      internship: 'internship_feedback',
      project: 'project_feedback'
    };

    const table = tables[category];

    if (!table) {
      return res.status(400).json({
        message: 'Invalid feedback category'
      });
    }

    const result = await pool.query(
      `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Feedback not found'
      });
    }

    res.json({
      message: 'Feedback deleted successfully',
      id: result.rows[0].id,
      category
    });

  } catch (error) {
    console.error('Delete Feedback Error:', error.message);
    res.status(500).json({
      message: 'Unable to delete feedback'
    });
  }
});

// OLD COLLEGE DELETE ROUTE - BACKWARD COMPATIBILITY
router.delete('/feedback/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Feedback not found'
      });
    }

    res.json({
      message: 'College feedback deleted successfully',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Delete Feedback Error:', error.message);
    res.status(500).json({
      message: 'Unable to delete feedback'
    });
  }
});

// APPROVE OR REJECT COLLEGE FEEDBACK ONLY
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
        message: 'College feedback not found'
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

// ADMIN DASHBOARD STATISTICS
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (
          (SELECT COUNT(*) FROM feedback) +
          (SELECT COUNT(*) FROM internship_feedback) +
          (SELECT COUNT(*) FROM project_feedback)
        )::int AS total_feedback,

        (SELECT COUNT(*)::int FROM feedback)
          AS college_feedback,

        (SELECT COUNT(*)::int FROM internship_feedback)
          AS internship_feedback,

        (SELECT COUNT(*)::int FROM project_feedback)
          AS project_feedback,

        (SELECT COUNT(*)::int FROM feedback
          WHERE status = 'pending')
          AS pending_feedback,

        (SELECT COUNT(*)::int FROM feedback
          WHERE status = 'approved')
          AS approved_feedback,

        (SELECT COUNT(*)::int FROM feedback
          WHERE status = 'rejected')
          AS rejected_feedback
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
