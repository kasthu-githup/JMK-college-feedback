
const bcrypt = require('bcryptjs');
const pool = require('./db');
require('dotenv').config();

async function createAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password || password.length < 12) {
      throw new Error(
        'Set ADMIN_USERNAME and a strong ADMIN_PASSWORD (minimum 12 characters) in .env'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO admins (username, password)
       VALUES ($1, $2)
       ON CONFLICT (username)
       DO UPDATE SET password = EXCLUDED.password`,
      [username, hashedPassword]
    );

    console.log('JMK Admin Account Created Successfully!');
    console.log('Admin Username:', username);

  } catch (error) {
    console.error('Admin Creation Error:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
