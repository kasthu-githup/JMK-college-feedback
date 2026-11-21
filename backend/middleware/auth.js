
const jwt = require('jsonwebtoken');

const verifyStudent = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Please login to continue'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== 'student') {
      return res.status(403).json({
        message: 'Student access only'
      });
    }

    req.student = {
      id: decoded.id,
      email: decoded.email
    };

    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired login session'
    });
  }
};

module.exports = verifyStudent;
