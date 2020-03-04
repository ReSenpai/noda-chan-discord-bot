console.log('Noda / Start...');

// require
// discord bot library
const discord = require('discord.js');
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');
// program config
const config = require('./config');
const fs = require('fs');
// mysql DB library
const mysql = require('mysql');
// library for making queries asinc-await
const util = require('util');
// mysql queries
const queries = require('./sql_queries');
// language processing library
const regex = require('./regex')
const utils = require('./utils')
const commands = require('./commands');

// bot vars
const bot = new discord.Client();
bot.commands = new discord.Collection();

// login bot
console.log('Noda / Login bot');
bot.login(config.token);

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
    
        // user info from discord
        const uid = message.author.id;
        let nickname = '';
        try {
            nickname = message.member.nickname;
        } catch (error) {
            // name for direct questions
            nickname = 'whisperer';
        }
        const username = message.author.username;
    
        // alias message.channel.send
        bot.send = function(msg) {
            message.channel.send(msg)
        }

        console.time('Noda / MSG / Get user info time');
        // add user if needed
        console.log('Noda / MSG / Add user into DB if needed ( may not handle nick change )');
        await query(queries.sql_add_user, [uid, username, nickname]);

        // get user info from DB
        console.log('Noda / MSG / Get user info from DB');
        const user_data = await query(queries.sql_get_user_info, [uid]);
        console.timeEnd('Noda / MSG / Get user info time');

        if (user_data) {
            // User Data
            console.log('Noda / MSG / Parse user data');
            let user = Object.assign({}, user_data[0]);
            user.uid = uid;
            user.avatar = message.author.avatarURL;
            user.question = null;
            user.answer = null;
            user.question_type = null;
            console.log(`Noda / MSG / User data: \n\tuser_name: '${user.username}'\n\tnickname: '${user.nickname}'` + 
                `\n\tuser_id: '${user.uid}'\n\tcoins: '${user.coins}'\n\tlvl: '${user.lvl}'\n\texp: '${user.exp}'\n\tquestions: '${user.question_num}'`);
            
            // system commands
            console.log('Noda / MSG / HM / Handle message');
            if(message.content[0] === '!') {
                console.time('Noda / MSG / Execute command');
                user = commands.exec(message, user, query);
                console.timeEnd('Noda / MSG / Execute command');
            // question to Noda
            } else {
                // "Нода ..."
                if(regex.noda.test(message.content)){
                    console.log(`Noda / MSG / HM / Bot's name`);
                    message.channel.send(utils.rndAnswer(utils.nodaAnsw));
                } else if (regex.question.test(message.content)) {
                    console.log(`Noda / MSG / HM / QN / Question to Noda`);
                    console.log(`Noda / MSG / HM / QN / Find the question in DB`);
                    // find the closest questions in DB
                    console.time('Noda / MSG / HM / QN / Question search time');
                    matched_questions = await query(queries.sql_find_question, [utils.stemming(message.content), user.uid]);
                    console.timeEnd('Noda / MSG / HM / QN / Question search time');
                    console.time('Noda / MSG / HM / QN / Answer time');
                    // if questions exist
                    if(matched_questions) {
                        console.log(`Noda / MSG / HM / QN / There are some question in DB`);
                        // maximum score to float
                        let max_score = matched_questions[0]['score'];
                        let ans = '';
                        // if max score greater than 0
                        if(max_score > 0) {
                            console.log(`Noda / MSG / HM / QN / Choosing the best answer`);
                            let score = 0;
                            for(qus of matched_questions) {
                                if(!ans && qus['type'] === 0) {
                                    ans = qus['answer'];
                                    score = qus['score'];
                                }
                                if(score && qus['score']/score < 0.7) {
                                    break;
                                } else if(qus['type'] === 1) {
                                    ans = qus['answer'];
                                    break;
                                }
                            }
                            // just in case
                            if(!ans) ans = 'ой';

                            // log top 3 matched questions
                            console.log(`Noda / MSG / HM / QN / Top 3 matched questions`);
                            matched_questions.forEach(function(elem, inx){
                                if(inx >= 3) return;
                                console.log(`\t${inx+1}. (${elem.score.toFixed(4)}) '${elem.question}' -- '${elem.answer}' -- ${elem.type}`);
                            })
                        } else {
                            console.log(`Noda / MSG / HM / QN / No matches with questions in DB`);
                            console.log(`Noda / MSG / HM / QN / Choose a random answer`);
                            // no similar questions in DB
                            ans = utils.rndAnswer(utils.confusedAnsw);
                        }
                        console.log(`Noda / MSG / HM / QN / Сhosen answer: '${ans}'`);
                        // answer
                        console.timeEnd('Noda / MSG / HM / QN / Answer time');
                        message.channel.send(ans);
                    }
                }
                // update coins, exp and lvl
                console.log(`Noda / MSG / HM / Add coins, exp and upd lvl`);
                user.coins += 1;
                user.exp += 1;
                if (user.exp >= user.lvl * 5) {
                    user.exp = user.exp - user.lvl * 5;
                    user.lvl += 1;
                }
            }

            // update user info in DB
            console.log(`Noda / MSG / HM / Update user data in DB`);
            console.time(`Noda / MSG / HM / Update user data time`);
            await query(queries.sql_upd_user_info, [user.coins, user.exp, user.lvl, user.questions, user.uid]);
            // if the user created a question
            if (user.question && user.answer) {
                console.log(`Noda / MSG / HM / Add bought question into DB`);
                // add question to table questions
                let add_question = await query(queries.sql_add_question, [utils.stemming(user.question)]);
                let question_id = add_question.insertId;
    
                // add answer to table answers
                let add_answer = await query(queries.sql_add_answer, [user.answer]);
                let answer_id = add_answer.insertId;

                // link added question and added answer in table conn_quest_ans
                await query(queries.sql_connect_question, [question_id, answer_id, user.uid, user.question_type]);
            }
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
