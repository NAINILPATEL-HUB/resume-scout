const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function initializeDatabase() {
  let connection = null;
  
  try {
    // Create a connection without specifying the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Connected to MySQL server.');

    // Create database if not exists
    await connection.execute('CREATE DATABASE IF NOT EXISTS resume_scout;');
    console.log('Created database: resume_scout');
    
    // Use the database
    await connection.execute('USE resume_scout;');
    console.log('Using database: resume_scout');

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        profile_picture VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        location VARCHAR(100) DEFAULT NULL,
        job_title VARCHAR(100) DEFAULT NULL,
        company VARCHAR(100) DEFAULT NULL,
        website VARCHAR(255) DEFAULT NULL,
        linkedin VARCHAR(255) DEFAULT NULL,
        github VARCHAR(255) DEFAULT NULL,
        skills TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Created table: users');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if the test user already exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (rows.length === 0) {
      // Insert test user
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Test User', 'test@example.com', hashedPassword, 'user']
      );
      console.log('Created test user: email=test@example.com, password=password123');
    } else {
      console.log('Test user already exists.');
    }

    console.log('Database initialization complete!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase(); 