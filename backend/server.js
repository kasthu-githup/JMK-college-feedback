
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://jmk-college-feedback-web.vercel.app'
  ]
}));

// BODY PARSER
app.use(express.json({ limit: '2mb' }));

// AUTH ROUTES
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// COLLEGE FEEDBACK
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);

// INTERNSHIP & JOB FEEDBACK
const internshipRoutes = require('./routes/internship');
app.use('/api/internship', internshipRoutes);

// PROJECT FEEDBACK
const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

// ADMIN
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// HOME
app.get('/', (req, res) => {
  res.json({
    message: 'JMK Education Center Backend Running Successfully!'
  });
});

// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`JMK Backend running on port ${PORT}`);
});
