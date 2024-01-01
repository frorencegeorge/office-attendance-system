//// import required modules..
const express = require("express");
const mysql = require("mysql2/promise");
const moment = require("moment-timezone");
const config = require("./config");


// create an express app..
const app =express();

//use middleware to parse incoming json data...
app.use(express.json());

//create mysql connection pool to the database..
const pool = mysql.createPool({
    host : "localhost",
    user : "root",
    database : "attendance",
});
 // api for sign out
 // ...

// ...

app.post('/signout', async (req, res) => {
    try {
        const { employee_reg } = req.body;

        // Validate if the employee exists in the system
        const [employee] = await pool.query('SELECT * FROM employee_account WHERE employee_reg=?', [employee_reg]);
        console.log('Employee:', employee);

        if (employee.length === 0) {
            return res.status(404).json({ error: 'Employee not found in the system' });
        }

        // Get the current timestamp in Tanzania's time and format it for MySQL
        const timestamp = moment().tz('Africa/Dar_es_Salaam').format('YYYY-MM-DD HH:mm:ss');

        // Update data in the 'sign_in' table for the employee to sign_out
        //const [result] = await pool.query('UPDATE sign_in SET time_out = NULL WHERE employee_reg = ? AND time_out IS NULL', [employee_reg]);
        const [result] = await pool.query('UPDATE sign_in SET time_out = NULL WHERE employee_reg = ? AND time_out = "0000-00-00 00:00:00"', [employee_reg]);

        //const [result] = await pool.query('UPDATE sign_in SET time_out = NULL WHERE employee_reg = ? AND time_out = ?', [employee_reg, '0000-00-00 00:00:00']);

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No active sign-in record found for the employee' });
        }

        res.json({ message: 'Time-out recorded successfully' }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// ...

// ...

/// start express app and lisstening port on the specified port
app.listen(config.PORT,async() =>{
    try{
        //test connection to the database connection....
        const connection = await pool.getConnection();
        console.log("connected to the database ");

        //release connection back to the post...
        connection.release();

    }
    catch (error){
        console.error("Error connecting to the database: " ,error);
    }
    console.log("Server listening on port " +config.PORT);

});
////i have end here......................................................................