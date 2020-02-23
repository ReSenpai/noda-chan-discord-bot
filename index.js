//- require
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const userLvl = require('./user_lvl.json');
const answers = require('./answers.json');
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');

// - vars
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const token = config.token;
const prefix = config.prefix;

bot.login(token);

// fs.readdir('./modules/',(err,files)=>{
//     if(err) console.log(err);
//     let jsfiles = files.filter(f => f.split(".").pop() === "js");
//     if(jsfiles.length <=0) console.log("Нет комманд для загрузки!!");
//     console.log(`Загружено ${jsfiles.length} комманд`);
//     jsfiles.forEach((f,i) =>{
//         let props = require(`./modules/${f}`);
//         console.log(`${i+1}.${f} Загружен!`);
//         bot.commands.set(props.help.name,props);
//     });
// });


bot.on('ready', async () => {
    console.log(`Нода тян запущена`);
    bot.generateInvite(["ADMINISTRATOR"]).then(link => {
        console.log(link);
    }).catch(err => {
        console.log(err.stack);
    })
});


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

    if(!userLvl[uid]) {
        userLvl[uid] = {
            nickname: nickname,
            username: username,
            coins: 10,
            warns: 0,
            xp: 0,
            lvl: 0,
            questions: {
                question: [],
                answer: []
            }
        }
    }

    const u = userLvl[uid];
    u.coins++;
    u.xp++;
    if(u.xp >= (u.lvl * 5)) {
        u.xp = 0;
        u.lvl += 1;
    }

    fs.writeFile('./user_lvl.json', JSON.stringify(userLvl), (err) => {
        if(err){
            console.log(err)
        }
    })
    
    if(message.channel.id === '677624287649333268' || message.channel.id === '678701864514224170' || message.channel.id === '624327775935004687') {
        if(/Нода дай монеток$|!монетки/i.test(message.content)){
            u.coins += 100;
            let pushCoins = new RichEmbed()
            .setTitle(`Запрос халявных монеток`)
            .setColor(0x36D904)
            .setDescription(`
            Держи 100 монеток :moneybag:
            Чеканных монет: ${userLvl[uid].coins} 
            `);
            message.channel.send(pushCoins);
        }
    }
    
});

// Блок с вопросами боту

bot.on('message', async message => {

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
                Общих вопросов куплено: ${answers[uid].answer.length}`);
                message.channel.send(embed);
            } else {
                let embed = new RichEmbed()
                .setTitle(`Профиль игрока: ${message.member.nickname}`)
                .setColor(0x0a4bff)
                .setDescription(`
                :trophy:LVL: ${userLvl[uid].lvl}
                :jigsaw:XP: ${userLvl[uid].xp}
                :moneybag:Чеканных монет: ${userLvl[uid].coins}
                :key:Общих вопросов куплено: ${answers[uid].answer.length}`);
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

    
});

// Покупка вопросов для ноды

bot.on('message', async message => {
    if(message.channel.id === '677624287649333268' || message.channel.id === '678701864514224170' || message.channel.id === '624327775935004687'){
        if(message.author.bot) return;
        if(message.channel.type === "dm") return;
        const uid = message.author.id;
        const u = userLvl[uid];

        if(/!купить вопрос$/i.test(message.content)){
            u.coins -= 1;
            const shop = new RichEmbed()
                .setTitle(`Нода-шоп!`)
                .setColor(0xebe134)
                .setDescription(`
                Ваш баланс монет: ${userLvl[uid].coins}
                Купить общий вопрос: 25 чеканных монет
                Купить личный вопрос: 100 чеканных монет

                Для покупки общего вопроса напишите: !купить общий вопрос
                `);
            message.channel.send(shop);
        }

        if(!answers[uid]) {
            answers[uid] = {
                question: [],
                answer: []
            }
        }

        const question = answers[uid].question;
        const answer = answers[uid].answer;

        if(/!купить общий вопрос$/i.test(message.content)){
            u.coins -= 1;
            if(userLvl[uid].coins >= 25){
                const commonQuestion = new RichEmbed()
                .setTitle(`Покупка общего вопроса.`)
                .setColor(0xebe134)
                .setDescription(`
                Ваш баланс монет: ${userLvl[uid].coins}
                Для покупки вопроса напишите или лучше скопируйте как шаблон:
                !вопрос [Тут пишите ваш вопрос, обязательно в квадратных скобочках] [А тут ваш ответ, так же в квадратных скобочках]
                `);
                message.channel.send(commonQuestion);
            } else {
                const commonQuestionFalse = new RichEmbed()
                .setTitle(`Отказано.`)
                .setColor(0xFF0000)
                .setDescription(`
                Не хватает чеканных монет, ваш баланс: ${userLvl[uid].coins}
                `);
                message.channel.send(commonQuestionFalse);
            }
            
        }

        if(/!вопрос/i.test(message.content)){
            let args = message.content.split(" [");
            if(u.coins >= 25){
                u.coins -= 26;
                question.push(args[1].slice(0, args[1].length - 1));
                answer.push(args[2].slice(0, args[2].length - 1));
                const commonQuestionBye = new RichEmbed()
                .setTitle(`Покупка оформлена.`)
                .setColor(0x36D904)
                .setDescription(`
                Ваш вопрос: ${args[1].slice(0, args[1].length - 1)}
                Ваш ответ: ${args[2].slice(0, args[2].length - 1)}
                Осталось чеканных монет: ${u.coins}
                Приятного использования😘
                `);
                message.channel.send(commonQuestionBye);
            } else {
                u.coins -= 1;
                message.channel.send(`Не хватает чеканных монет, ваш баланс: ${u.coins}`);
            }
            // console.log(args);
        }

        fs.writeFile('./answers.json', JSON.stringify(answers), (err) => {
            if(err){
                console.log(err)
            }
        })
    }

});

// Сбор логов

// bot.on('message', async message => {
//     if(message.author.bot) return;

//     if (message.content === '!id') {
//         console.log(message.author.id);
//         message.channel.send('Ок, я увидела твой id');
//     } else if(message.content === '!log'){
//         console.log(message.author);
//         message.channel.send('Логи собраны');
//     } else if(message.content === '!channelid'){
//         message.channel.send('id канала собрано');
//         console.log(message.channel.id)
//     }
// });


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

