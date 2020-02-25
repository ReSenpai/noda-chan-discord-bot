// include npm module mysql
var mysql = require('mysql');

// create database connection
var connection  = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb"
});

// connect to database
connection.connect(function(err) {
    if (err) {
        console.error('DB / database connection error: ' + err.stack);
        return;
    }
    console.log('DB / connected as id ' + connection.threadId);
});

// add user sql query
var user_id = "'1234'";
var user_name = "'Tester'";
var server_name = '';


sql_add_user = 
`INSERT IGNOR INTO users (user_id, user_name, server_name)
    VALUES (${user_id}, ${user_name}, ${server_name})`;

console.log('sql_add_user:\n' + sql_add_user);

connection.query(sql_add_user, function (error, results, fields) {
    console.log('error: ' + error);
    console.log(results);
    // console.log(fields);
});

// add question
var question = "'Пятерик есть, а если найду?'";
var answer = "'Ты че дерьвалаз, ты по деревьям в детстве лазал? Если лазал, то дерьволаз!'";
var user_id = "'1234'";

var sql_add_question = 
`INSERT INTO questions (text)
    VALUES (${answer})`

var get_last_id = 
`SELECT LAST_INSERT_ID() as lastID`

console.log('sql_add_question:\n' + sql_add_question);

connection.query(sql_add_question, function (error, results, fields) {
    console.log('error: ' + error);
    console.log(results);
    // console.log(fields);
});

connection.query(get_last_id, function (error, results, fields) {
    // console.log('error: ' + error);
    console.log(results);
    question_id = results[0]['lastID'];
    console.log(question_id);
});

connection.end();