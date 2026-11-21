
const pool = require('./db');

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password TEXT NOT NULL,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        college_name VARCHAR(200) NOT NULL,
        department VARCHAR(150),
        admission_year INTEGER,
        agent_name VARCHAR(150),
        overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
        guidance_rating INTEGER CHECK (guidance_rating BETWEEN 1 AND 5),
        communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
        support_rating INTEGER CHECK (support_rating BETWEEN 1 AND 5),
        review TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('JMK Database Tables Created Successfully!');
  } catch (error) {
    console.error('Table Creation Error:', error.message);
  } finally {
    await pool.end();
  }
};

createTables();
