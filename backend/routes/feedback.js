
const express = require('express');
const pool = require('../db');
const verifyStudent = require('../middleware/auth');

const router = express.Router();

// SUBMIT NEW FEEDBACK
router.post('/', verifyStudent, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      college_name,
      department,
      admission_year,
      agent_name,
      overall_rating,
      guidance_rating,
      communication_rating,
      support_rating,
      review,
      profile_image
    } = req.body;

    if (
      !college_name ||
      !department ||
      !admission_year ||
      !agent_name ||
      !review
    ) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      });
    }

    const ratings = [
      overall_rating,
      guidance_rating,
      communication_rating,
      support_rating
    ];

    if (
      ratings.some(
        rating =>
          !Number.isInteger(Number(rating)) ||
          Number(rating) < 1 ||
          Number(rating) > 5
      )
    ) {
      return res.status(400).json({
        message: 'Ratings must be between 1 and 5'
      });
    }

    // Validate uploaded image
    if (profile_image) {
      const validImage =
        /^data:image\/(jpeg|png|webp);base64,/i.test(profile_image);

      if (!validImage) {
        return res.status(400).json({
          message: 'Only JPG, PNG and WEBP images are allowed'
        });
      }

      if (profile_image.length > 2500000) {
        return res.status(400).json({
          message: 'Image is too large. Please upload a smaller image.'
        });
      }
    }

    await client.query('BEGIN');

    // Save uploaded photo in student profile
    if (profile_image) {
      await client.query(
        `UPDATE students
         SET profile_image = $1
         WHERE id = $2`,
        [profile_image, req.student.id]
      );
    }

    const result = await client.query(
      `INSERT INTO feedback (
        student_id, college_name, department,
        admission_year, agent_name, overall_rating,
        guidance_rating, communication_rating,
        support_rating, review
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        req.student.id,
        college_name.trim(),
        department.trim(),
        Number(admission_year),
        agent_name.trim(),
        Number(overall_rating),
        Number(guidance_rating),
        Number(communication_rating),
        Number(support_rating),
        review.trim()
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Feedback submitted successfully. Waiting for admin approval.',
      feedback: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Feedback Submit Error:', error.message);

    res.status(500).json({
      message: 'Unable to submit feedback'
    });

  } finally {
    client.release();
  }
});

// GET LOGGED-IN STUDENT'S FEEDBACK
router.get('/my', verifyStudent, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM feedback
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [req.student.id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('My Feedback Error:', error.message);

    res.status(500).json({
      message: 'Unable to fetch feedback'
    });
  }
});

// PUBLIC APPROVED FEEDBACK
router.get('/approved', async (req, res) => {
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
        f.review,
        f.created_at
      FROM feedback f
      JOIN students s ON f.student_id = s.id
      WHERE f.status = 'approved'
      ORDER BY f.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Public Feedback Error:', error.message);

    res.status(500).json({
      message: 'Unable to load approved feedback'
    });
  }
});

module.exports = router;
