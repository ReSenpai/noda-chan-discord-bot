const token = 'Njc3NjYyNDYwNzQ4MjM0NzYy.XkXgwQ.w_EYiJ8v0vEzXtVI_N1HEREl3Rc';
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
    