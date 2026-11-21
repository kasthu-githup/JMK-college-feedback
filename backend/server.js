
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json({ limit: '2mb' }));

// Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const feedbackRoutes = require('./routes/feedback');
app.use('/api/feedback', feedbackRoutes);
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'JMK Education Center Backend Running Successfully!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`JMK Backend running on port ${PORT}`);
});
