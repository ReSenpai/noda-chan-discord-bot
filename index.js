console.log('Noda / Start...');
// require
// discord bot library
const Discord = require('discord.js');
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');
// program config
const config = require('./config.json');
const fs = require('fs');
// mysql DB library
const mysql = require('mysql');
// library for making queries asinc-await
const util = require('util');
// mysql queries
const queries = require('./sql_queries.json');
// language processing library
var natural = require('natural');

// require modules
fs.readdir('./modules/',(err,files)=>{
    if(err) console.log(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <=0) console.log("Noda / Nothing to load");
    console.log(`Noda / LM / Loading ${jsfiles.length} module(s)`);
    jsfiles.forEach((f,i) =>{
        let props = require(`./modules/${f}`);
        console.log(`Noda / LM / ${f} module is loaded`);
        for(let i = 0; i < props.help.name.length; i++){
            bot.commands.set(props.help.name[i],props);
        }
    });
});

console.log('Noda / All modules are connected');

// bot vars
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const token = config.token;
const prefix = config.prefix;

// regex
const buy_question = new RegExp(prefix + '\\купить вопрос$','i');
const buy_common_question = new RegExp(prefix + '\\общий вопрос$','i');
const buy_personal_question = new RegExp(prefix + '\\личный вопрос$','i');
const just_question = new RegExp(prefix + '\\вопрос','i');
const show_profile = new RegExp(prefix + '\\профиль$|^нода покажи мой профиль','i');
const personal_question = /^личный$/i;
const common_question = /^общий$/i;

// login bot
console.log('Noda / Loging bot');
bot.login(token);

// bot.on('ready', async () => {
//     bot.generateInvite(["ADMINISTRATOR"]).then(link => {
//         console.log(`Noda / Invite link: ${link}`);
//     }).catch(err => {
//         console.log(err.stack);
//     })
// });

console.log('Noda / Bot initialized');

// russian stemming
var tokenizer = new natural.WordTokenizer();
function stemming(str) {
    let words = tokenizer.tokenize(str);
    let stems = [];
    for (word of words) {
        stems.push(natural.PorterStemmerRu.stem(word));
    }
    str_stemmed = stems.join(' ')
    console.log(`Noda / Stemmed / ${str_stemmed}`);
    return str_stemmed;
}

// connect to DB
console.log('Noda / MSG / Create MySQL connection');
// create pool connection
let connection  = mysql.createPool({
    connectionLimit:    10,
    host:               config.DB.host,
    user:               config.DB.user,
    password:           config.DB.password,
    database:           config.DB.database,
    acquireTimeout:     1000000,
    connectTimeout:     20000,
    supportBigNumbers: true,
    bigNumberStrings: true
});

// make MySQL query async-await
const query = util.promisify(connection.query).bind(connection);

console.log('Noda / MSG / Start listening');
// Handle messages
bot.on('message', async message => {
    try {
        console.time('Noda / MSG / TIME');
        console.log('Noda / MSG / Handle new message');
        console.log('===================================================');
        // don't handle messages from bots
        if(message.author.bot)
        {
            console.log('Noda / MSG / Author is a bot');
            return;
        }
        console.log(`Noda / MSG / Message text: '${message.content}'`);
            
        // don't handle direct messages
        // if(message.channel.type === "dm") return;
    
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
    
        // unused?
        bot.send = function(msg) {
            message.channel.send(msg)
        }

        // add user if needed
        console.log('Noda / MSG / Add user into DB if needed ( may not handle nick change )');
        await query(queries.sql_add_user, [uid, username, nickname]);

        // get user info from DB
        console.log('Noda / MSG / Get user info from DB');
        const user_data = await query(queries.sql_get_user_info, [uid]);

        if (user_data) {
            // User Data
            console.log('Noda / MSG / Parse user data');
            let coins = user_data[0]['coins'];
            let exp = user_data[0]['exp'];
            let lvl = user_data[0]['lvl'];
            let nickname = user_data[0]['server_name'];
            let username = user_data[0]['user_name'];
            let avatar = message.author.avatarURL;
            let question_num = user_data[0]['questions'];
            let question = null;
            let answer = null;
            console.log(`Noda / MSG / User data: \n\tuser_name: '${username}'\n\tnickname: '${nickname}'` + 
                `\n\tuser_id: '${uid}'\n\tcoins: '${coins}'\n\tlvl: '${lvl}'\n\texp: '${exp}'\n\tquestions: '${question_num}'`);
            
            // system commands
            console.log('Noda / MSG / HM / Handle message');
            if(/^нода$/i.test(message.content)){
                console.log(`Noda / MSG / HM / Bot's name`);
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
                // Buy questions guide
            } else if(buy_question.test(message.content)){
                console.log(`Noda / MSG / HM / Buy question info`);
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
                // Buy common_questions guide
            } else if(buy_common_question.test(message.content)){
                console.log(`Noda / MSG / HM / Buy common question info`);
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
                // Buy personal_question guide 
            } else if(buy_personal_question.test(message.content)){
                console.log(`Noda / MSG / HM / Buy personal question info`);
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
            // buy questions with code
            } else if(just_question.test(message.content)){
                console.log(`Noda / MSG / HM / BQ / Buy a question!`);
                let args = message.content.split(" [");
                if (coins >= 25 && args.length >= 2) {
                    console.log(`Noda / MSG / HM / BQ / Enough money for a common question and the question has proper structure`);
                    question = args[1].slice(0, -1);
                    answer = args[2].slice(0, -1);
                    try {
                        question_type = args[3].slice(0, -1);
                    } catch(error) {
                        question_type = 0;
                    }
                    console.log(`Noda / MSG / HM / BQ / Question type ${question_type}`);
                    if(personal_question.test(question_type)){
                        if(coins >= 100) {
                            console.log(`Noda / MSG / HM / BQ / Personal question was bought`);
                            question_type = 1;
                            coins -= 100;
                        } else {
                            console.log(`Noda / MSG / HM / BQ / Not enough money for personal question`);
                            bot.send(`Не хватает чеканных монет для покупки личного вопроса.\nВаш баланс: ${coins} монет!`)
                            return;
                        }
                    } else if(question_type === 0 || common_question.test(question_type)){
                        console.log(`Noda / MSG / HM / BQ / Common question was bought`);
                        question_type = 0;
                        coins -= 25;
                    } else {
                        console.log(`Noda / MSG / HM / BQ / Incorrect question type`);
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
                    console.log(`Noda / MSG / HM / BQ / Q: '${question}', A: '${answer}', T: '${question_type}'`);
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
                    console.log(`Noda / MSG / HM / Not enough money for a common question`);
                    message.channel.send(`${args.length >= 2 ? 'Не хватает чеканных монет, ваш баланс:' + coins : 'Вы неправильно написали шаблон для покупки вопроса, можете посмотреть правильные шаблоны, написав "!купить общий вопрос" или "!купить личный вопрос"'}`);
                }
            // Show profiles
            } else if (show_profile.test(message.content)) {
                console.log(`Noda / MSG / HM / Show profiles`);
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
                console.log(`Noda / MSG / HM / Throw a cube`);
                message.channel.send(Math.ceil(Math.random() * 10)); 
            } else {
                // "Нода ..." или "!..."
                if (/^Нода|^!/i.test(message.content)) {
                    console.log(`Noda / MSG / HM / QN / Question to Noda`);
                    // "Нода дай монет"
                    if (/Дай монет|монетки/i.test(message.content)) {
                        console.log(`Noda / MSG / HM / QN / Give some coins`);
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
                        console.log(`Noda / MSG / HM / QN / Find the question in DB`);
                        // find the closest questions in DB
                        matched_questions = await query(queries.sql_find_question, [stemming(message.content), uid]);
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
                                    } else if(qus['type'] === 1 && qus['user_id'] === uid) {
                                        ans = qus['answer'];
                                        break;
                                    }
                                }

                                // just in case
                                if(!ans) ans = 'ой';

                                // log top 3 matched questions
                                console.log(`Noda / MSG / HM / QN / Top 3 matched questions`);
                                if(matched_questions.length > 3) {
                                    console.log(matched_questions.slice(0, 3));
                                } else {
                                    console.log(matched_questions);
                                }
                            } else {
                                console.log(`Noda / MSG / HM / QN / No matches with questions in DB`);
                                console.log(`Noda / MSG / HM / QN / Choose a random answer`);
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
                            console.log(`Noda / MSG / HM / QN / Сhosen answer: '${ans}'`);
                            // answer
                            message.channel.send(ans);
                        }
                    }
                }
                // update coins, exp and lvl
                console.log(`Noda / MSG / HM / Add coins, exp and upd lvl`);
                coins += 1;
                exp += 1;
                if (exp >= lvl * 5) {
                    exp = 0;
                    lvl += 1;
                }
            }

            // update user info in DB
            console.log(`Noda / MSG / HM / Update user data in DB`);
            await query(queries.sql_upd_user_info, [coins, exp, lvl, question_num, uid]);
            // if the user created a question
            if (question && answer) {
                console.log(`Noda / MSG / HM / Add bought question into DB`);
                // add question to table questions
                var add_question = await query(queries.sql_add_question, [stemming(question)]);
                var question_id = add_question.insertId;
    
                // add answer to table answers
                add_answer = await query(queries.sql_add_answer, [answer]);
                var answer_id = add_answer.insertId;

                // link added question and added answer in table conn_quest_ans
                await query(queries.sql_connect_question, [question_id, answer_id, uid, question_type]);
            }
        }
    // handle errors
    } catch (error) {
        console.log('Noda / MSG / ERROR');
        console.log(error);
    } finally {
        console.timeEnd('Noda / MSG / TIME');
    }
});


// Новый участник

// bot.on('guildMemberAdd', member => {
//     const channel = member.guild.channels.find(ch => ch.name === 'member-log');

//     if (!channel) return;
//     channel.send(`Добро пожаловать на сервер, ${member}`);
// });

