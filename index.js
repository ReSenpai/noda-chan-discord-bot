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
const logger = require('./logger');

logger.log(1, 'MAIN', 'Start...');

// bot vars
const bot = new discord.Client();
bot.commands = new discord.Collection();

// login bot
logger.log(1, 'MAIN', 'Login bot');
bot.login(config.token);

// get invite link
bot.on('ready', async () => {
    bot.generateInvite(["ADMINISTRATOR"]).then(link => {
        logger.log(1, 'MAIN', `Invite link: ${link}`);
    }).catch(err => {
        logger.log(1, 'MAIN', err.stack);
    })
});
logger.log(1, 'MAIN', 'Bot initialized');

// connect to DB
logger.log(1, 'MSG', 'Create MySQL connection');
// create pool connection
let connection  = mysql.createPool(config.DB);
// make MySQL query async-await
const query = util.promisify(connection.query).bind(connection);

// handle messages
logger.log(1, 'MSG', 'Start listening');
bot.on('message', async message => {
    try {
        logger.time(2, 'MSG', 'TIME');
        logger.log(1, 'MSG', '===================================================');
        logger.log(1, 'MSG', 'Handle new message');

        // don't handle messages from bots
        if(message.author.bot)
        {
            logger.log(2, 'MSG', 'Author is a bot');
            return;
        }
        logger.log(2, 'MSG', `Message text: '${message.content}'`);
    
        let user = {};
        // get user info from discord
        utils.getDiscordInfo(message, user, query);

        logger.time(3, 'MSG', 'Get user info time');
        // add user if needed
        logger.log(2, 'MSG', 'Add user into DB if needed ( may not handle nick change )');
        await query(queries.sql_add_user, [user.uid, user.user_name, user.server_name]);

        // get user info from DB
        logger.log(3, 'MSG', 'Get user info from DB');
        const user_data = await query(queries.sql_get_user_info, [user.uid]);
        logger.timeEnd(3, 'MSG', 'Get user info time');

        if (user_data) {
            // user data
            logger.log(2, 'MSG', 'Parse user info');
            user = {...user_data[0], ...user, question: null, answer: null, question_type: null};

            // log user info
            logger.log(3, 'MSG', `User info: \n\tuser_name: '${user.user_name}'\n\tnickname: '${user.server_name}'` + 
                `\n\tuser_id: '${user.uid}'\n\tcoins: '${user.coins}'\n\tlvl: '${user.lvl}'\n\texp: '${user.exp}'\n\tquestions: '${user.questions}'\n\tdaily_time: '${user.daily_time}'`);
            
            // system commands
            logger.log(2, 'MSG', 'Handle message');
            logger.time(3, 'MSG', 'Handle message time');
            if(message.content[0] === '!') {
                await commands.exec(message, user, query);
            // question to Noda
            } else {
                await quest.handle(message, user, query);
            }
            logger.timeEnd(3, 'MSG', 'Handle message time');

            // update user info in DB
            logger.log(2, 'MSG', 'Update user data in DB');
            logger.time(3, 'MSG', 'Update user data time');
            query(queries.sql_upd_user_info, [user.coins, user.exp, user.lvl, user.questions, user.uid]);
            
            // add question into DB
            utils.updUserInfo(message, user, query);
            logger.timeEnd(3, 'MSG', 'Update user data time');
        }
    // handle errors
    } catch (error) {
        logger.log(1, 'MSG', 'ERROR');
        console.log(error);
    } finally {
        logger.timeEnd(2, 'MSG', 'TIME');
    }
});