const token = 'NjgxOTQxNTk1NjcwNTc3MTg4.XlVx6A.R9uu8loTr-EcUAQV4PdJN3wfsBk';
const DB = {    host: 'localhost',
                    user: 'root',
                    password: '', 
                    database: 'mydb',
                    acquireTimeout:     1000000,
                    connectTimeout:     20000,
                    supportBigNumbers: true,
                    bigNumberStrings: true    
                };

module.exports.token = token;
module.exports.DB = DB;
    