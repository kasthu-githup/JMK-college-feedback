
const pool = require('./db');

async function testDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('JMK Database Connected Successfully!');
    console.log('Database Time:', result.rows[0].now);
  } catch (error) {
    console.error('Database Error:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
