const mysql = require('mysql');
const config = require('./index');

const connection = mysql.createConnection({
    host: "localhost",
    user: config.databaseUsername,
    password: config.databasePw,
    database: "platonic"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS users (username VARCHAR(255), email VARCHAR(255), password VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table is ready");
    });
});

module.exports = connection;