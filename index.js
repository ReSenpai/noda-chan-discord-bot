// queries
const sql_add_user = 
`INSERT IGNORE INTO users (user_id, user_name, server_name)
    VALUES (?, ?, ?)`;

const sql_get_user_info =
`SELECT * FROM users
    WHERE user_id = ?`;

const sql_upd_user_info = 
`UPDATE users
    SET coins = ?, exp = ?, lvl = ?
    WHERE user_id = ?`;

const sql_add_question = 
`INSERT INTO questions (text)
    VALUES (?)`;
                            
const sql_add_answer = 
`INSERT INTO answers (text)
    VALUES (?)`;

const sql_connect_question = 
`INSERT INTO conn_quest_ans (question_id, answer_id, user_id)
    VALUES (?, ?, ?);`;

const sql_find_question = 
`SELECT questions.text AS question, answers.text as answer, 
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

// bot.on('ready', async () => {
//     console.log(`Нода тян запущена`);
//     bot.generateInvite(["ADMINISTRATOR"]).then(link => {
//         console.log(link);
//     }).catch(err => {
//         console.log(err.stack);
//     })
// });

// Handle messages
bot.on('message', async message => {
    try {
        // don't handle messages from bots
        if(message.author.bot) return;
        // don't handle direct messages
        if(message.channel.type === "dm") return;

        console.log('===================================================');
    
        // user info from discord
        const uid = message.author.id;
        const nickname = message.member.nickname;
        const username = message.author.username;
    
        // unused?
        bot.send = function(msg) {
            message.channel.send(msg)
        }

        // connection info
        const connection  = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "mydb"
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
            let question = null;
            let answer = null;

            if(/!купить вопрос$/i.test(message.content)){
                const shop = new RichEmbed()
                    .setTitle(`Нода-шоп!`)
                    .setColor(0xebe134)
                    .setDescription(`
                    Ваш баланс монет: ${coins}
                    Купить общий вопрос: 25 чеканных монет
                    Купить личный вопрос: 100 чеканных монет
    
                    Для покупки общего вопроса напишите: !купить общий вопрос
                    `);
                message.channel.send(shop);
            } else if(/!купить общий вопрос$/i.test(message.content)){
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
            } else if(/!вопрос/i.test(message.content)){
                let args = message.content.split(" [");
                if (coins >= 25) {
                    coins -= 25;
                    question = args[1].slice(0, -1);
                    answer = args[2].slice(0, -1);

                    const commonQuestionBye = new RichEmbed()
                    .setTitle(`Покупка оформлена.`)
                    .setColor(0x36D904)
                    .setDescription(`
                    Ваш вопрос: ${question}
                    Ваш ответ: ${answer}
                    Осталось чеканных монет: ${coins}
                    Приятного использования😘
                    `);
                    message.channel.send(commonQuestionBye);
                } else {
                    message.channel.send(`Не хватает чеканных монет, ваш баланс: ${coins}`);
                }
            } else if (/!профиль$|нода покажи мой профиль/i.test(message.content)) {
                // console.log(message.member.nickname);
                // console.log(userLvl[uid].coins);
                // console.log(message.author)
        
                if(message.member.nickname === null){
                    let embed = new RichEmbed()
                    .setTitle(`Профиль игрока: ${username}`)
                    .setColor(0x0a4bff)
                    .setDescription(`
                    :trophy:LVL: ${lvl}
                    :jigsaw:XP: ${exp}
                    Чеканных монет: ${coins} :moneybag:
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
                    `)
                    .setThumbnail(avatar)
                    message.channel.send(embed);
                }
            }else {
                // "Нода ..."
                if (/^Нода|^!/i.test(message.content)) {
                    // "Нода дай монет"
                    if (/Дай монет|монетки/i.test(message.content)) {
                        // give 1000 coins
                        coins += 1000;
                        let pushCoins = new RichEmbed()
                        .setTitle(`Запрос халявных монеток`)
                        .setColor(0x36D904)
                        .setDescription(`
                        Держи 1000 монеток :moneybag:
                        Чеканных монет: ${coins} 
                        `);
                        message.channel.send(pushCoins);
                    } else {
                        // find the closes questions in DB
                        matched_questions = await query(sql_find_question, [message.content]);
                        // if questions exist
                        if(matched_questions) {
                            // maximum score to float
                            let max_score = parseFloat(matched_questions[0]['score']);
                            let ans = '';
                            // if max score greater than 0
                            if(max_score > 0) {
                                // answer to user
                                ans = matched_questions[0]['answer'];
                            } else {
                                // no similar questions in DB
                                ans = 'сложно, сложно, нихуя не понятно.'
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
            await query(sql_upd_user_info, [coins, exp, lvl, uid]);
            // if the user created a question
            if (question && answer) {
                // add question to table questions
                var add_question = await query(sql_add_question, [question]);
                var question_id = add_question.insertId;
    
                // add answer to table answers
                add_answer = await query(sql_add_answer, [answer]);
                var answer_id = add_answer.insertId;

                // link added question and added answer in table conn_quest_ans
                await query(sql_connect_question, [question_id, answer_id, uid]);

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
        console.log('DB / disconnected');
        if(connection) connection.end();
    }
});

    // if(message.channel.id === '677624287649333268' || message.channel.id === '678701864514224170' || message.channel.id === '624327775935004687') {
    //     if(/Нода дай монеток$|!монетки/i.test(message.content)){
    //         u.coins += 100;
    //         let pushCoins = new RichEmbed()
    //         .setTitle(`Запрос халявных монеток`)
    //         .setColor(0x36D904)
    //         .setDescription(`
    //         Держи 100 монеток :moneybag:
    //         Чеканных монет: ${userLvl[uid].coins} 
    //         `);
    //         message.channel.send(pushCoins);
    //     }
    // }


// Блок с вопросами боту

/*bot.on('message', async message => {

    if(message.author.bot) return;

    bot.userlvl

    if(message.channel.id === '677624287649333268' || message.channel.id === '678701864514224170' || message.channel.id === '624327775935004687'){
        if (/Нода$/i.test(message.content)) {
            if(message.author.id === '206808155890384898'){
                message.channel.send('Слушаю вас о божество');
            } else if(message.author.id === '124548144133308416') {
                message.channel.send('Да, ваше благородие?:3');
            } else {
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
            }
        }
        if (message.content === 'Нода тян'){
            message.channel.send('Ты просишь, но просишь без уважения:3')
        }
        if (message.content == 'От сушка') {
            message.channel.send('Бан!! ._.')
        }
        if (message.content === 'Нода привет') {
            message.channel.send('Здрасьте:3');
        }
        if (message.content === '!кубик') {
            message.channel.send(Math.ceil(Math.random() * 10));
        }
        if (message.content === 'Нода попращайся') {
            message.channel.send('До новых встре:3');
        }
        
        if (/!профиль$|нода покажи мой профиль/i.test(message.content)) {
            const uid = message.author.id;
            userLvl[uid].coins -= 1;
            const coinsIcon = new Attachment('./Gold_coin_icon.png');
    
            // console.log(message.member.nickname);
            // console.log(userLvl[uid].coins);
            // console.log(message.author)
    
            if(message.member.nickname === null){
                let embed = new RichEmbed()
                .setTitle(`Профиль игрока: ${message.author.username}`)
                .setColor(0x0a4bff)
                .setDescription(`
                :trophy:LVL: ${userLvl[uid].lvl}
                :jigsaw:XP: ${userLvl[uid].xp}
                Чеканных монет: ${userLvl[uid].coins} :moneybag:
                Общих вопросов куплено: ${answers[uid].answer.length}`)
                .setThumbnail(message.author.avatarURL)
                message.channel.send(embed);
            } else {
                let embed = new RichEmbed()
                .setTitle(`Профиль игрока: ${message.member.nickname}`)
                .setColor(0x0a4bff)
                .setDescription(`
                :trophy:LVL: ${userLvl[uid].lvl}
                :jigsaw:XP: ${userLvl[uid].xp}
                :moneybag:Чеканных монет: ${userLvl[uid].coins}
                :key:Общих вопросов куплено: ${answers[uid].answer.length}`)
                .setThumbnail(message.author.avatarURL)
                message.channel.send(embed);
            }
        }
    
        for (var id in answers) {
            let counter = -1;
    
            for (var key in answers[id].question) {
                counter += 1;
                if(message.content === answers[id].question[counter]){
                    message.channel.send(answers[id].answer[counter])
                }
                // console.log(answers[id].question[counter])
            }
            
        }
    }

    
});*/


// Новый участник

// bot.on('guildMemberAdd', member => {
//     const channel = member.guild.channels.find(ch => ch.name === 'member-log');

//     if (!channel) return;
//     channel.send(`Добро пожаловать на сервер, ${member}`);
// });


// Тестирование



// bot.on('emojiCreate', async Emoji => {
//     console.log(Emoji);
// })

