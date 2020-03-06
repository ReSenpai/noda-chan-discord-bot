console.log('Noda / Start...');

// discord bot library
const discord = require('discord.js');
// mysql DB library
const mysql = require('mysql');
// library for making queries asinc-await
const util = require('util');
// program config
const config = require('./config');
// mysql queries
const queries = require('./queries');
// language processing library
const utils = require('./utils')
const commands = require('./commands');
const quest =  require('./quest');
const bj = require('./blackjack');
const regex = require('./regex');

// bot vars
const bot = new discord.Client();
bot.commands = new discord.Collection();

// login bot
console.log('Noda / Login bot');
bot.login(config.token);

// get invite link
bot.on('ready', async () => {
    bot.generateInvite(["ADMINISTRATOR"]).then(link => {
        console.log(`Noda / Invite link: ${link}`);
    }).catch(err => {
        console.log(err.stack);
    })
});
console.log('Noda / Bot initialized');

// connect to DB
console.log('Noda / MSG / Create MySQL connection');
// create pool connection
let connection  = mysql.createPool(config.DB);
// make MySQL query async-await
const query = util.promisify(connection.query).bind(connection);

// handle messages
console.log('Noda / MSG / Start listening');
bot.on('message', async message => {
    try {
        console.time('Noda / MSG / TIME');
        console.log('===================================================');
        console.log('Noda / MSG / Handle new message');

        // don't handle messages from bots
        if(message.author.bot)
        {
            console.log('Noda / MSG / Author is a bot');
            return;
        }
        console.log(`Noda / MSG / Message text: '${message.content}'`);
    
        let user = {};
        // get user info from discord
        utils.getDiscordInfo(message, user, query);

        console.time('Noda / MSG / Get user info time');
        // add user if needed
        console.log('Noda / MSG / Add user into DB if needed ( may not handle nick change )');
        await query(queries.sql_add_user, [user.uid, user.user_name, user.server_name]);

        // get user info from DB
        console.log('Noda / MSG / Get user info from DB');
        const user_data = await query(queries.sql_get_user_info, [user.uid]);
        console.timeEnd('Noda / MSG / Get user info time');

        if (user_data) {
            // user data
            console.log('Noda / MSG / Parse user info');
            user = {...user_data[0], ...user, question: null, answer: null, question_type: null};

            // log user info
            console.log(`Noda / MSG / User info: \n\tuser_name: '${user.user_name}'\n\tnickname: '${user.server_name}'` + 
                `\n\tuser_id: '${user.uid}'\n\tcoins: '${user.coins}'\n\tlvl: '${user.lvl}'\n\texp: '${user.exp}'\n\tquestions: '${user.questions}'`);
            
            // system commands
            console.log('Noda / MSG / HM / Handle message');
            console.time('Noda / MSG / HM / Handle message time');
            if(message.content[0] === '!') {
                await commands.exec(message, user, query);
            // question to Noda
            } else {
                await quest.handle(message, user, query);
            }
            console.timeEnd('Noda / MSG / HM / Handle message time');

            // update user info in DB
            console.log(`Noda / MSG / HM / Update user data in DB`);
            console.time(`Noda / MSG / HM / Update user data time`);
            query(queries.sql_upd_user_info, [user.coins, user.exp, user.lvl, user.questions, user.uid]);
            
            // add question into DB
            utils.updUserInfo(message, user, query);
            console.timeEnd(`Noda / MSG / HM / Update user data time`);
        }
    // handle errors
    } catch (error) {
        console.log('Noda / MSG / ERROR');
        console.log(error);
    } finally {
        console.timeEnd('Noda / MSG / TIME');
    }
});