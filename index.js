//- require
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const userLvl = require('./user_lvl.json');
const answers = require('./answers.json');
const mysql = require('mysql');
// const constructors = require('./functions/constructors.js');
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');

// - vars
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const token = config.token;
const prefix = config.prefix;
const connection  = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mydb"
});

bot.login(token);

connection.connect(function(err) {
    if (err) {
        console.error('DB / database connection error: ' + err.stack);
        return;
    }
    console.log('DB / connected as id ' + connection.threadId);
});

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
            // console.log(props.help.name[i])
        }
        // console.log(props.help.name);
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


// Конструктор прокачки профилей дискорда

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    const uid = message.author.id;
    const nickname = message.member.nickname;
    const username = message.author.username;

    bot.send = function(msg) {
        message.channel.send(msg)
    }

    const sql_add_user = 
    `INSERT IGNORE INTO users (user_id, user_name, server_name)
        VALUES ('${uid}', '${username}', '${nickname}')`;

    console.log('sql_add_user:\n' + sql_add_user);

    connection.query(sql_add_user, function (error, results, fields) {
        // console.log('error: ' + error);
        // console.log(results);
        // console.log(fields);
    });

    const sql_get_user_info =
    `SELECT * FROM users
        WHERE user_id = '${uid}'`;

    
    connection.query(sql_get_user_info, function (error, results, fields) {
        if (results) {
            var coins = results[0]['coins'];
            var exp = results[0]['exp'];
            var lvl = results[0]['lvl'];
            var nickname = results[0]['server_name'];
            var username = results[0]['user_name'];

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
                if(coins >= 25){
                    coins -= 25;
                    question = args[1].slice(0, args[1].length - 1);
                    answer = args[2].slice(0, args[2].length - 1);

                    const sql_add_question = 
                    `INSERT INTO questions (text)
                        VALUES ('${question}')`;
                    
                        const sql_add_answer = 
                    `INSERT INTO answers (text)
                        VALUES ('${answer}')`;

                        const sql_last_index = 
                    `SELECT LAST_INSERT_ID() AS last_index`;

                    var question_id = null;
                    var answer_id = null;
                    connection.query(sql_add_question, function (error, results, fields) {
                    //    console.log('error: ' + error);
                    //    console.log(results);
                    //    console.log(fields);
                    });

                    connection.query(sql_last_index, function (error, results, fields) {
                            console.log('results: ')
                            console.log(results);
                            console.log(results[0]['last_index']);
                            question_id = results[0]['last_index'];
                    });
                    console.log(question_id);
                    connection.query(sql_add_answer, function (error, results, fields) {
                    //    console.log('error: ' + error);
                    //    console.log(results);
                    //    console.log(fields);
                    });

                    connection.query(sql_last_index, function (error, results, fields) {
                        answer_id = results[0]['last_index'];
                    });

                    const sql_connect_question = 
                    `INSERT INTO conn_quest_ans (question_id, answer_id, user_id)
                        VALUES ('${question_id}', '${answer_id}', '${uid}');`;

                    connection.query(sql_connect_question, function (error, results, fields) {
                        console.log('error: ' + error);
                    //    console.log(results);
                    //    console.log(fields);
                    });

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
            } else {
                coins += 1;
                exp += 1;
                if (exp >= lvl * 5) {
                    exp = 0;
                    lvl += 1;
                }
            }

            const sql_upd_user_info = 
            `UPDATE users
                SET coins = '${coins}', exp = '${exp}', lvl = '${lvl}'
                WHERE user_id = '${uid}'`;
            connection.query(sql_upd_user_info, function (error, results, fields) {
                // console.log('error: ' + error);
                // console.log('users: ');
                // console.log(results);
            });

            // log users
            const sql_get_users = `SELECT * FROM users`
            console.log(sql_get_users);
            connection.query(sql_get_users, function (error, results, fields) {
                console.log('users: ');
                console.log(results);
            });

            // log users
            const sql_get_questions = `SELECT * FROM questions`
            console.log(sql_get_questions);
            connection.query(sql_get_questions, function (error, results, fields) {
                console.log('questions: ');
                console.log(results);
            });

            // log users
            const sql_get_answers = `SELECT * FROM answers`
            console.log(sql_get_answers);
            connection.query(sql_get_answers, function (error, results, fields) {
                console.log('answers: ');
                console.log(results);
            });

            // log users
            const sql_get_conn_quest = `SELECT * FROM conn_quest_ans`
            console.log(sql_get_conn_quest);
            connection.query(sql_get_conn_quest, function (error, results, fields) {
                console.log('conn_quest: ');
                console.log(results);
            });
        }
    });

    // sql_add_coins_exp = 
    // `UPDATE users
    //     SET coins = coins + 1, exp = exp + 1
    //     WHERE user_id = '${uid}'`;

    // console.log('sql_add_coins_exp:\n' + sql_add_coins_exp);

    // connection.query(sql_add_coins_exp, function (error, results, fields) {
    //     // console.log('error: ' + error);
    //     // console.log(results);
    //     // console.log(fields);
    // });

    // sql_upd_lvl =
    // `SELECT exp, lvl FROM users
    //     WHERE user_id = '${uid}'`;

    // connection.query(sql_upd_lvl, function (error, results, fields) {
    //     // console.log('error: ' + error);
    //     // console.log(results);
    //     // console.log(fields);
    //     if (results) {
    //         var exp = results[0]['exp'];
    //         var lvl = results[0]['lvl'];
    //         if(exp >= (lvl * 5)) {
    //             sql_lvl_up = 
    //             `UPDATE users
    //             SET lvl = lvl + 1, exp = 0
    //             WHERE user_id = '${uid}'`;
    //             connection.query(sql_lvl_up, function (error, results, fields) {
    //                 // console.log('error: ' + error);
    //                 // console.log(results);
    //                 // console.log(fields);
    //             });
    //         }
    //     }
    // });
    
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
    
});


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

// Покупка вопросов для ноды

/*bot.on('message', async message => {
    if(message.channel.id === '677624287649333268' || message.channel.id === '678701864514224170' || message.channel.id === '624327775935004687'){
        if(message.author.bot) return;
        if(message.channel.type === "dm") return;
        const uid = message.author.id;
        const u = userLvl[uid];


        fs.writeFile('./answers.json', JSON.stringify(answers), (err) => {
            if(err){
                console.log(err)
            }
        })
    }

    let messageArray = message.content.split(" ");
    let command = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
    if(!message.content.startsWith(prefix)) return;
    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot,message,args);
    bot.rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    bot.uId = message.author.id;

    // console.log(cmd);


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

