const express = require('express');
const multer = require('multer');
const pool = require('../db');
const verifyStudent = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['video/mp4', 'video/webm'].includes(file.mimetype)) {
      return cb(new Error('Only MP4 and WEBM videos are allowed'));
    }
    cb(null, true);
  }
});

function uploadVideo(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'jmk-feedback-videos' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

// SUBMIT INTERNSHIP / JOB FEEDBACK
router.post('/', verifyStudent, (req, res, next) => {
  upload.single('video')(req, res, error => {
    if (error) {
      return res.status(400).json({
        message: error.code === 'LIMIT_FILE_SIZE'
          ? 'Video must be 20 MB or smaller'
          : error.message
      });
    }
    next();
  });
}, async (req, res) => {
  let uploadedVideo = null;

  try {
    const {
      company_name,
      job_role,
      duration,
      stipend,
      overall_rating,
      review
    } = req.body;

    if (!company_name?.trim() || !review?.trim()) {
      return res.status(400).json({
        message: 'Company name and review are required'
      });
    }

    const rating = Number(overall_rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    if (req.file) {
      uploadedVideo = await uploadVideo(req.file);
    }

    const result = await pool.query(
      `INSERT INTO internship_feedback
       (student_id, company_name, job_role, duration, stipend,
        overall_rating, review, video_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        req.student.id,
        company_name.trim(),
        job_role?.trim() || null,
        duration?.trim() || null,
        stipend?.trim() || null,
        rating,
        review.trim(),
        uploadedVideo?.secure_url || null
      ]
    );

    res.status(201).json({
      message: 'Internship feedback submitted successfully',
      feedback: result.rows[0]
    });

  } catch (error) {
    if (uploadedVideo) {
      try {
        await cloudinary.uploader.destroy(uploadedVideo.public_id, {
          resource_type: 'video'
        });
      } catch (cleanupError) {
        console.error('Video cleanup error:', cleanupError.message);
      }
    }

    console.error('Internship Feedback Error:', error.message);
    res.status(500).json({
      message: 'Unable to submit internship feedback'
    });
  }
});

// STUDENT'S INTERNSHIP FEEDBACK
router.get('/my', verifyStudent, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM internship_feedback
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [req.student.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Unable to fetch feedback' });
  }
});

// PUBLIC INTERNSHIP FEEDBACK
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         f.id,
         s.name AS student_name,
         s.profile_image,
         f.company_name,
         f.job_role,
         f.duration,
         f.stipend,
         f.overall_rating,
         f.review,
         f.video_url,
         f.created_at
       FROM internship_feedback f
       JOIN students s ON s.id = f.student_id
       ORDER BY f.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Unable to load internship feedback' });
  }
});

module.exports = router;