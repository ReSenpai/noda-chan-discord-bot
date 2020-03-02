// queries
const sql_add_user = 
`INSERT IGNORE INTO users (user_id, user_name, server_name)
    VALUES (?, ?, ?)`;

const sql_get_user_info =
`SELECT * FROM users
    WHERE user_id = ?`;
const sql_get_conn_quest_ans_info =
`SELECT * FROM conn_quest_ans
    WHERE user_id = ?`;
const sql_upd_user_info = 
`UPDATE users
    SET coins = ?, exp = ?, lvl = ?, questions = ?
    WHERE user_id = ?`;

const sql_add_question = 
`INSERT INTO questions (text)
    VALUES (?)`;
                            
const sql_add_answer = 
`INSERT INTO answers (text)
    VALUES (?)`;

const sql_connect_question = 
`INSERT INTO conn_quest_ans (question_id, answer_id, user_id, type)
    VALUES (?, ?, ?, ?);`;

const sql_find_question = 
`SELECT questions.text AS question, answers.text AS answer, type, 
    MATCH (questions.text) AGAINST (? IN BOOLEAN MODE) AS score 
    FROM questions 
    JOIN conn_quest_ans USING (question_id) 
    JOIN answers USING (answer_id) 
    ORDER BY score DESC LIMIT 100`;

// require
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const mysql = require('mysql');
const util = require('util');
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');

// bot vars
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const token = config.token;
const prefix = config.prefix;

// login bot
bot.login(token);

// require modules
fs.readdir('./modules/',(err,files)=>{
    if(err) console.log(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <=0) console.log("Нет комманд для загрузки!!");
    console.log(`Загружено ${jsfiles.length} комманд`);
    jsfiles.forEach((f,i) =>{
        let props = require(`./modules/${f}`);
        console.log(`${i+1}.${f} Загружен!`);
        for(let i = 0; i < props.help.name.length; i++){
            bot.commands.set(props.help.name[i],props);
        }
    });
});

// Regex
const buy_question = new RegExp(prefix + '\\купить вопрос$','i');
const buy_common_question = new RegExp(prefix + '\\общий вопрос$','i');
const buy_personal_question = new RegExp(prefix + '\\личный вопрос$','i');
const just_question = new RegExp(prefix + '\\вопрос','i');
const show_profile = new RegExp(prefix + '\\профиль$|^нода покажи мой профиль','i');
const personal_question = /^личный$/i;
const common_question = /^общий$/i;

// bot.on('ready', async () => {
//     console.log(`Нода тян запущена`);
//     bot.generateInvite(["ADMINISTRATOR"]).then(link => {
//         console.log(link);
//     }).catch(err => {
//         console.log(err.stack);
//     })
// });

// stemming
// npm i natural
var natural = require('natural');
var tokenizer = new natural.WordTokenizer();
function stemming(str) {
    let words = tokenizer.tokenize(str);
    let stems = [];
    for (word of words) {
        stems.push(natural.PorterStemmerRu.stem(word));
    }
    return stems.join(' ');
}

// Handle messages
bot.on('message', async message => {
    try {
        // don't handle messages from bots
        if(message.author.bot) return;
        // don't handle direct messages
        // if(message.channel.type === "dm") return;

        console.log('===================================================');
    
        // user info from discord
        const uid = message.author.id;
        let nickname = '';
        try {
            nickname = message.member.nickname;
        } catch (error) {
            nickname = 'whisperer';
        }
        
        const username = message.author.username;
    
        // unused?
        bot.send = function(msg) {
            message.channel.send(msg)
        }

        // connection info
        const connection  = mysql.createConnection({
            host:       config.DB.host,
            user:       config.DB.user,
            password:   config.DB.password,
            database:   config.DB.database
        });

        // make MySQL query async-await
        const query = util.promisify(connection.query).bind(connection);
    
        // handle errors
        connection.on('error', function() {
            console.log('Connection cancelled due to timeout or another error');
        });

        // connect to database
        connection.connect(function(err) {
            if (err) {
                console.error('DB / database connection error: ' + err.stack);
                return;
            }
            console.log('DB / connected as id ' + connection.threadId);
        });

        // add user if needed ( may not handle nick change )
        await query(sql_add_user, [uid, username, nickname]);

        // get user info from DB
        const user_data = await query(sql_get_user_info, [uid]);
        console.log('User Data: ');
        console.log(user_data);

        if (user_data) {
            // User Data
            let coins = user_data[0]['coins'];
            let exp = user_data[0]['exp'];
            let lvl = user_data[0]['lvl'];
            let nickname = user_data[0]['server_name'];
            let username = user_data[0]['user_name'];
            let avatar = message.author.avatarURL;
            let question_num = user_data[0]['questions'];
            let question = null;
            let answer = null;
            
            // System command
            if(/^нода$/i.test(message.content)){
                let randomNumber = Math.ceil(Math.random() * 10);
                switch(randomNumber){
                    case 1:
                        message.channel.send('Шито?');
                        break;
                    case 2:
                        message.channel.send('Отстань, я занята...');
                        break;
                    case 3:
                        message.channel.send('Ну шо такое?');
                        break;
                    case 4:
                        message.channel.send('Хватит меня звать ._.');
                        break;
                    case 5:
                        message.channel.send('Ваще то моё полное имя - Нода тян');
                        break;
                    case 6:
                        message.channel.send('Ась?');
                        break;
                    case 7:
                        message.channel.send('Шо надо то?');
                        break;
                    case 8:
                        message.channel.send('Слушаю:3');
                        break;
                    case 9:
                        message.channel.send('Как банный лист пристал...');
                        break;
                }
                // Bye questions guide
            } else if(buy_question.test(message.content)){
                const shop = new RichEmbed()
                    .setTitle(`Нода-шоп!`)
                    .setColor(0xebe134)
                    .setDescription(`
                    Ваш баланс монет: ${coins}
                    Купить общий вопрос: 25 чеканных монет
                    Купить личный вопрос: 100 чеканных монет
    
                    Для покупки общего вопроса напишите: !общий вопрос
                    Для покупки личного вопроса напишите: !личный вопрос
                    `);
                message.channel.send(shop);
                // Bye common_questions guide
            } else if(buy_common_question.test(message.content)){
                if(coins >= 25){
                    const commonQuestion = new RichEmbed()
                    .setTitle(`Покупка общего вопроса.`)
                    .setColor(0xebe134)
                    .setDescription(`
                    Ваш баланс монет: ${coins}
                    Для покупки вопроса напишите или лучше скопируйте как шаблон:
                    !вопрос [Тут пишите ваш вопрос, обязательно в квадратных скобочках] [А тут ваш ответ, так же в квадратных скобочках]
                    `);
                    message.channel.send(commonQuestion);
                } else {
                    const commonQuestionFalse = new RichEmbed()
                    .setTitle(`Отказано.`)
                    .setColor(0xFF0000)
                    .setDescription(`
                    Не хватает чеканных монет, ваш баланс: ${coins}
                    `);
                    message.channel.send(commonQuestionFalse);
                }  
                // Bye personal_question guide 
            } else if(buy_personal_question.test(message.content)){
                if(coins >= 100){
                    let plate = new RichEmbed()
                    .setTitle(`Покупка личного вопроса.`)
                    .setColor(0xebe134)
                    .setDescription(`
                    Ваш баланс монет: ${coins}
                    Для покупки вопроса напишите или лучше скопируйте как шаблон:
                    !вопрос [Тут пишите ваш вопрос, обязательно в квадратных скобочках] [А тут ваш ответ, так же в квадратных скобочках] [личный]
                    `);
                    message.channel.send(plate);
                } else {
                    let plate_false = new RichEmbed()
                    .setTitle(`Отказано.`)
                    .setColor(0xFF0000)
                    .setDescription(`
                    Не хватает чеканных монет, ваш баланс: ${coins}
                    `);
                    message.channel.send(plate_false);
                }  
                // Bye questions code
            } else if(just_question.test(message.content)){
                let args = message.content.split(" [");
                if (coins >= 25 && args.length >= 2) {
                    question = args[1].slice(0, -1);
                    answer = args[2].slice(0, -1);
                    try {
                        question_type = args[3].slice(0, -1);
                    } catch(error) {
                        question_type = 0;
                    }
                    console.log(question);
                    console.log(question_type);
                    if(personal_question.test(question_type)){
                        if(coins >= 100) {
                            question_type = 1;
                            coins -= 100;
                            console.log(question_type);
                        } else {
                            bot.send(`Не хватает чеканных монет для покупки личного вопроса.\nВаш баланс: ${coins} монет!`)
                            return;
                        }
                    } else if(question_type === 0 || common_question.test(question_type)){
                        question_type = 0;
                        coins -= 25;
                        console.log(question_type);
                    } else {
                        let plate = new RichEmbed()
                        .setTitle(`Ошибка`)
                        .setColor(0xFF0000)
                        .setDescription(`
                        Вы неправильно указали тип вопроса.
                        Для покупки личного вопроса, в конце оформления покупки обычного вопроса допишите [личный].
                        Для покупки общего вопроса можно вообще не писать тип вопроса или напишите [общий]
                        `)
                        bot.send(plate);
                        return;
                    }
                    question_num += 1;
                    const commonQuestionBye = new RichEmbed()
                    .setTitle(`Покупка оформлена.`)
                    .setColor(0x36D904)
                    .setDescription(`
                    Ваш вопрос: ${question}
                    Ваш ответ: ${answer}
                    Тип вопроса: ${question_type === 0 ? 'общий' : 'личный'}
                    Осталось чеканных монет: ${coins}
                    Приятного использования😘
                    `);
                    message.channel.send(commonQuestionBye);
                } else {
                    message.channel.send(`${args.length >= 2 ? 'Не хватает чеканных монет, ваш баланс:' + coins : 'Вы неправильно написали шаблон для покупки вопроса, можете посмотреть правильные шаблоны, написав "!купить общий вопрос" или "!купить личный вопрос"'}`);
                }
                // Show profiles
            } else if (show_profile.test(message.content)) {
                if(message.member.nickname === null){
                    let embed = new RichEmbed()
                    .setTitle(`Профиль игрока: ${username}`)
                    .setColor(0x0a4bff)
                    .setDescription(`
                    :trophy:LVL: ${lvl}
                    :jigsaw:XP: ${exp}
                    Чеканных монет: ${coins} :moneybag:
                    :key:Общих вопросов куплено: ${question_num}
                    `)
                    .setThumbnail(avatar)
                    message.channel.send(embed);
                } else {
                    let embed = new RichEmbed()
                    .setTitle(`Профиль игрока: ${nickname}`)
                    .setColor(0x0a4bff)
                    .setDescription(`
                    :trophy:LVL: ${lvl}
                    :jigsaw:XP: ${exp}
                    :moneybag:Чеканных монет: ${coins}
                    :key:Общих вопросов куплено: ${question_num}
                    `)
                    .setThumbnail(avatar)
                    message.channel.send(embed);
                }
                // Throw a cube
            } else if(message.content === '!кубик') {
                message.channel.send(Math.ceil(Math.random() * 10)); 
            } else {
                // "Нода ..."
                if (/^Нода|^!/i.test(message.content)) {
                    // "Нода дай монет"
                    if (/Дай монет|монетки/i.test(message.content)) {
                        // give 100 coins
                        coins += 100;
                        let pushCoins = new RichEmbed()
                        .setTitle(`Запрос халявных монеток`)
                        .setColor(0x36D904)
                        .setDescription(`
                        Держи 100 монеток :moneybag:
                        Чеканных монет: ${coins} 
                        `);
                        message.channel.send(pushCoins);
                    } else {
                        // find the closes questions in DB
                        matched_questions = await query(sql_find_question, [stemming(message.content)]);
                        personal_question_check = await query(sql_get_conn_quest_ans_info, [uid]);
                        let check_id = 0;
                        try {
                            check_id = personal_question_check[0]['user_id'];
                        } catch(error) {
                            check_id = 0;
                        }
                        console.log(personal_question_check);
                        console.log(`user id = ${check_id}`);
                        console.log(uid == check_id);
                        // if questions exist
                        if(matched_questions) {
                            console.log('question_type :' + matched_questions[0]['type']);
                            // maximum score to float
                            let type = matched_questions[0]['type'];
                            let max_score = parseFloat(matched_questions[0]['score']);
                            let ans = '';
                            // if max score greater than 0
                            if(max_score > 0) {
                                if(type === 1) {
                                   if(uid == check_id) {
                                        ans = matched_questions[0]['answer'];    
                                   } else {
                                        ans = matched_questions[0]['answer'];
                                   }
                                } else {
                                    ans = matched_questions[0]['answer'];
                                }       
                            } else {
                                // no similar questions in DB
                                let randomNumber = Math.ceil(Math.random() * 5);
                                switch(randomNumber){
                                    case 1:
                                        ans = 'Cложно, сложно, ни**я не понятно.';
                                        break;
                                    case 2:
                                        ans = 'Чееего *лять?';
                                        break;
                                    case 3:
                                        ans = 'Ни**я не поняла, но очень интересно:3';
                                        break;
                                    case 4:
                                        ans = 'Чот я ничего не поняла';
                                        break;
                                    case 5:
                                        ans = 'А можно помедленее? Я записываю...';
                                        break;
                                }
                            }
                            // answer
                            message.channel.send(ans);
                        }
                        console.log('Matched questions');
                        console.log(matched_questions);
                    }
                }
                // update coins, exp and lvl
                coins += 1;
                exp += 1;
                if (exp >= lvl * 5) {
                    exp = 0;
                    lvl += 1;
                }
            }

            // update user info in DB
            await query(sql_upd_user_info, [coins, exp, lvl, question_num, uid]);
            // if the user created a question
            if (question && answer) {
                // add question to table questions
                var add_question = await query(sql_add_question, [stemming(question)]);
                var question_id = add_question.insertId;
    
                // add answer to table answers
                add_answer = await query(sql_add_answer, [answer]);
                var answer_id = add_answer.insertId;

                // link added question and added answer in table conn_quest_ans
                await query(sql_connect_question, [question_id, answer_id, uid, question_type]);

                // close connection to DB
                console.log('DB / disconnected');
                connection.end();
            } else {
                // close connection to DB
                console.log('DB / disconnected');
                connection.end();
            }
        }
    // handle errors
    } catch (error) {
        console.log(error);
        if(connection) {
            console.log('DB / disconnected');
            connection.end();
        }
         
    }
});


// Новый участник

// bot.on('guildMemberAdd', member => {
//     const channel = member.guild.channels.find(ch => ch.name === 'member-log');

//     if (!channel) return;
//     channel.send(`Добро пожаловать на сервер, ${member}`);
// });

