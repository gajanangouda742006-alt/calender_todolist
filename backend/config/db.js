const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sahra_calendar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
});

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL connection successful:', rows[0].result);
    return true;
  } catch (error) {
    console.warn('MySQL not connected. Start MySQL and create the database first.');
    console.warn(error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
