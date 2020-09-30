const token = 'Njc3NjYyNDYwNzQ4MjM0NzYy.XkXgWQ.2vsUfl6RRpbvUy4b_sBheTCDhNs';
const DB = {    host: 'localhost',
                    user: 'root',
                    password: '', 
                    database: 'mydb',
                    acquireTimeout:     1000000,
                    connectTimeout:     20000,
                    supportBigNumbers: true,
                    bigNumberStrings: true    
                };

module.exports = {token, DB};
    