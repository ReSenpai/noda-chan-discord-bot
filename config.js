const token = 'NjgxOTQxNTk1NjcwNTc3MTg4.Xmb-UA.zLUfCjJETCUFPWO3HwsbTpBw-6s';

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
    
