const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MYSQL@123",
    database: "attendance_db"
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

app.get("/", (req, res) => {
    res.send("Attendance Backend Running!");
});
app.get("/employees", (req, res) => {

    const sql = `
        SELECT
            e.employee_id,
            e.employee_name,
            CASE
                WHEN a.employee_id IS NULL THEN 'Absent'
                ELSE 'Present'
            END AS status,
            a.attendance_time
        FROM employees e
        LEFT JOIN attendance a
            ON e.employee_id = a.employee_id
            AND a.attendance_date = CURDATE()
        ORDER BY e.employee_id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Failed to fetch employees"
            });
        }

        res.json(results);
    });
});
app.post("/attendance", (req, res) => {

    const { employee_id } = req.body;

  const sql = `
    INSERT INTO attendance
    (employee_id, attendance_date, attendance_time, status)
    VALUES (?, CURDATE(), CURTIME(), 'Present')
`;

    db.query(sql, [employee_id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Attendance failed"
            });
        }

        res.json({
            message: "Attendance marked Present"
        });
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});