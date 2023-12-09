// Import required modules
const express = require("express");
const mysql = require("mysql2/promise");
const config = require("./config");

// Create an Express app instance
const app = express();

// Use middleware to parse incoming JSON data
app.use(express.json());

// Create a MySQL connection pool with specified configurations
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "attendance",
});

// Start the Express app, listening on the specified port
app.listen(config.PORT, async () => {
  try {
    // Test the database connection
    const connection = await pool.getConnection();
    console.log("Connected to the database");

    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }

  console.log("Server listening on port " + config.PORT);
});

// Define a POST route for employee registration
app.post("/reg_employee", async (req, res) => {
    const { first_name, middle_name, surname, dob, user_id, username } = req.body;

    const conn = await pool.getConnection();
    try {
        // Begin a database transaction
        await conn.beginTransaction();

        // Execute an SQL query to insert employee data
        const [employeeResult] = await conn.execute(
            "INSERT INTO employee (first_name, middle_name, surname, dob, user_id) VALUES (?,?,?,?,?)",
            [first_name, middle_name, surname, dob, user_id]
        );

        const employeeId = employeeResult.insertId;

        // Generate a unique ID using the unique() function
        const regid = unique();

        // Generate a random password
        const password = generatePassword();

        // Execute another SQL query to insert employee account data with generated password
        await conn.execute(
            "INSERT INTO employee_account (username, password, employee_reg, employee_id) VALUES (?,?,?,?)",
            [username, password, regid.toString(), employeeId]
        );

        // Commit the transaction if everything is successful
        await conn.commit();

        console.log("Employee registration successful");

        // Send a JSON response for success
        res.status(200).json({ message: "Employee registration successful" });
    } catch (error) {
        // Handle errors and rollback the transaction
        console.error(error);
        await conn.rollback();

        // Send a JSON response for error
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        // Release the connection back to the pool
        console.log("Connection released.");
        conn.release();
    }
});

// Function to generate a unique ID
function unique() {
  let date_ob = new Date();
  const header = "12";
  const id =
    header +
    date_ob.getSeconds().toString() +
    date_ob.getMilliseconds().toString();

  console.log(id);
  return id;
}

// Function to generate a random password
function generatePassword() {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
}
