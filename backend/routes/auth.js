
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// STUDENT SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      profileImage
    } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters'
      });
    }

    // Validate optional profile image
    if (
      profileImage &&
      (
        typeof profileImage !== 'string' ||
        !/^data:image\/(jpeg|png|webp);base64,/.test(profileImage) ||
        profileImage.length > 1400000
      )
    ) {
      return res.status(400).json({
        message: 'Invalid image or image is too large'
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM students WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO students
       (name, email, phone, password, profile_image)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, profile_image`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        hashedPassword,
        profileImage || null
      ]
    );

    res.status(201).json({
      message: 'Student registered successfully',
      student: result.rows[0]
    });

  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({
      message: 'Server error during signup'
    });
  }
});

// STUDENT LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password, profile_image
       FROM students
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const student = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        profile_image: student.profile_image
      }
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
});
// GET LOGGED-IN STUDENT PROFILE
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authorization token required'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `SELECT id, name, email, phone, profile_image
       FROM students
       WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    res.json({
      student: result.rows[0]
    });

  } catch (error) {
    console.error('Profile Error:', error.message);
    res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
