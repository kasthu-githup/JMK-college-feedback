
const express = require('express');
const multer = require('multer');
const pool = require('../db');
const verifyStudent = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// VIDEO UPLOAD SETTINGS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm'];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only MP4 and WEBM videos are allowed'));
    }

    cb(null, true);
  }
});

// UPLOAD VIDEO TO CLOUDINARY
function uploadVideoToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: 'jmk-feedback-videos'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

// SUBMIT NEW FEEDBACK
router.post(
  '/',
  verifyStudent,
  (req, res, next) => {
    upload.single('video')(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message:
            error.code === 'LIMIT_FILE_SIZE'
              ? 'Video must be 20 MB or smaller'
              : error.message
        });
      }

      next();
    });
  },
  async (req, res) => {
    let client;
    let transactionStarted = false;
    let uploadedVideo = null;

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

      // VALIDATE PROFILE IMAGE
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

      // UPLOAD VIDEO IF PROVIDED
      if (req.file) {
        uploadedVideo = await uploadVideoToCloudinary(req.file);
      }

      const videoUrl = uploadedVideo
        ? uploadedVideo.secure_url
        : null;

      client = await pool.connect();

      await client.query('BEGIN');
      transactionStarted = true;

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
          student_id,
          college_name,
          department,
          admission_year,
          agent_name,
          overall_rating,
          guidance_rating,
          communication_rating,
          support_rating,
          review,
          video_url
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
          review.trim(),
          videoUrl
        ]
      );

      await client.query('COMMIT');
      transactionStarted = false;

      res.status(201).json({
        message: 'Feedback submitted successfully!',
        feedback: result.rows[0]
      });

    } catch (error) {
      if (client && transactionStarted) {
        await client.query('ROLLBACK');
      }

      // REMOVE CLOUDINARY VIDEO IF DATABASE SAVE FAILED
      if (uploadedVideo) {
        try {
          await cloudinary.uploader.destroy(uploadedVideo.public_id, {
            resource_type: 'video'
          });
        } catch (cleanupError) {
          console.error('Video cleanup error:', cleanupError.message);
        }
      }

      console.error('Feedback Submit Error:', error.message);

      res.status(500).json({
        message: 'Unable to submit feedback'
      });

    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

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

// PUBLIC FEEDBACK - SHOW ALL SUBMITTED FEEDBACK
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
        f.video_url,
        f.created_at
      FROM feedback f
      JOIN students s ON f.student_id = s.id
      ORDER BY f.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Public Feedback Error:', error.message);

    res.status(500).json({
      message: 'Unable to load feedback'
    });
  }
});

module.exports = router;
