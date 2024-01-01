// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');  // Correct the import statement
const config = require('./config');

// Create an Express app instance
const app = express();

// Use middleware to parse incoming JSON data
app.use(express.json());

// Create a MySQL connection pool with specified configurations
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'attendance',
});

// Start the Express app, listening on the specified port
app.listen(config.PORT, async () => {
    try {
        // Test the database connection
        const connection = await pool.getConnection();
        console.log('Connected to the database');

        // Release the connection back to the pool
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }

    console.log('Server listening on port ' + config.PORT);
});

// Rest of your code...


///////sign out api...
// Assuming you have already defined 'app' and 'pool' in your code

app.post('/signout', async (req, res) => {
    try {
      const { employee_reg } = req.body;
  
      // Check if the employee_reg exists in the employee_account table
      const [employee] = await pool.query('SELECT * FROM employee_account WHERE employee_reg = ?', [employee_reg]);
  
      if (employee.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      // Get the current timestamp in MySQL-compatible format
      const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
  
      // Update the 'time_out' column in the last record of 'sign_in' table for the employee
      await pool.query('UPDATE sign_in SET time_out = ? WHERE employee_reg = ? ORDER BY time_in DESC LIMIT 1', [timestamp, employee_reg]);
  
      res.json({ message: 'Time-out recorded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
  });
  
