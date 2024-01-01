// import required modules..
const express = require("express");
const mysql = require("mysql2/promise");
const config = require("./config");
const moment = require("moment-timezone");

// create an express app..
const app = express();

// use middleware to parse incoming json data..
app.use(express.json());

// create mysql connection pool to the database
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "attendance",
});

app.post('/signin', async (req, res) => {
  try {
    const { employee_reg } = req.body;

    // Check if the employee_reg exists in the employee_account table
    const [employee] = await pool.query('SELECT * FROM employee_account WHERE employee_reg = ?', [employee_reg]);

    if (employee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // get the current timestamp in Tanzania's timezone and format it for MySQL
    const timestamp = moment().tz('Africa/Dar_es_Salaam').format('YYYY-MM-DD HH:mm:ss');

    // Insert data into the 'sign_in' table without specifying the time_out column
    const [result] = await pool.query('INSERT INTO sign_in (employee_reg, time_in) VALUES (?, ?)', [employee_reg, timestamp]);

    res.json({ message: 'Time-in recorded successfully', insertId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// start express app and listening port on the specified port
app.listen(config.PORT, async () => {
  try {
    // test connection to the database connection..
    const connection = await pool.getConnection();
    console.log("Connected to the database");
    // release connection back to the pool..
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }

  console.log("Server listening on port " + config.PORT);
});
