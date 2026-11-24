
const express = require('express');
const multer = require('multer');
const pool = require('../db');
const verifyStudent = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// VIDEO UPLOAD SETTINGS
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4 and WebM videos are allowed'));
    }
  }
});

// UPLOAD VIDEO TO CLOUDINARY
const uploadVideoToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'jmk-feedback-videos',
        resource_type: 'video'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

// SUBMIT PROJECT FEEDBACK
router.post(
  '/',
  verifyStudent,
  upload.single('video'),
  async (req, res) => {
    let videoUrl = null;

    try {
      const {
        project_title,
        domain,
        technologies,
        guide_name,
        overall_rating,
        review
      } = req.body;

      if (!project_title || !review) {
        return res.status(400).json({
          message: 'Project title and review are required'
        });
      }

      const rating = Number(overall_rating);

      if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          message: 'Rating must be between 1 and 5'
        });
      }

      if (req.file) {
        videoUrl = await uploadVideoToCloudinary(req.file);
      }

      const studentId = req.student.id;

      const result = await pool.query(
        `INSERT INTO project_feedback
        (
          student_id,
          project_title,
          domain,
          technologies,
          guide_name,
          overall_rating,
          review,
          video_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          studentId,
          project_title.trim(),
          domain || null,
          technologies || null,
          guide_name || null,
          rating,
          review.trim(),
          videoUrl
        ]
      );

      res.status(201).json({
        message: 'Project feedback submitted successfully',
        feedback: result.rows[0]
      });

    } catch (error) {
      console.error('Project Feedback Error:', error.message);

      res.status(500).json({
        message: 'Unable to submit project feedback'
      });
    }
  }
);

// GET LOGGED-IN STUDENT PROJECT FEEDBACK
router.get('/my', verifyStudent, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM project_feedback
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [req.student.id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('My Project Feedback Error:', error.message);

    res.status(500).json({
      message: 'Unable to load your project feedback'
    });
  }
});

// GET ALL PUBLIC PROJECT FEEDBACK
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         f.id,
         f.student_id,
         s.name AS student_name,
         s.profile_image,
         f.project_title,
         f.domain,
         f.technologies,
         f.guide_name,
         f.overall_rating,
         f.review,
         f.video_url,
         f.created_at
       FROM project_feedback f
       LEFT JOIN students s ON s.id = f.student_id
       ORDER BY f.created_at DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Public Project Feedback Error:', error.message);

    res.status(500).json({
      message: 'Unable to load project feedback'
    });
  }
});

// MULTER ERROR HANDLER
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'Video upload error. Maximum size is 20 MB.'
    });
  }

  if (error) {
    return res.status(400).json({
      message: error.message
    });
  }

  next();
});

module.exports = router;

