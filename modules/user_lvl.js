const Discord = module.require("discord.js");
const userLvl = require('../user_lvl.json');
const fs = require('fs');
const bot = new Discord.Client();


const ololo = bot.on('message', async message => {
    if(message.author.bot) return;

    if (message.content === '!id') {
        console.log(message.author.id);
        message.channel.send('Ок, я увидела твой id');
    } else if(message.content === '!log'){
        console.log(message.author);
        message.channel.send('Логи собраны');
    } else if(message.content === '!channelid'){
        message.channel.send('id канала собрано');
        console.log(message.channel.id)
    }
});

module.exports.ololo = ololo;

// Конструктор прокачки профилей дискорда

// module.exports.run = async (bot, message) => {

//     if(message.author.bot) return;
//     if(message.channel.type === "dm") return;

//     const uid = message.author.id;
//     const nickname = message.member.nickname;
//     const username = message.author.username;

//     bot.send = function(msg) {
//         message.channel.send(msg)
//     }

//     if(!userLvl[uid]) {
//         userLvl[uid] = {
//             nickname: nickname,
//             username: username,
//             coins: 10,
//             warns: 0,
//             xp: 0,
//             lvl: 0,
//             questions: {
//                 question: [],
//                 answer: []
//             }
//         }
//     }

//     const u = userLvl[uid];
//     u.coins++;
//     u.xp++;
//     if(u.xp >= (u.lvl * 5)) {
//         u.xp = 0;
//         u.lvl += 1;
//     }

//     fs.writeFile('./user_lvl.json', JSON.stringify(userLvl), (err) => {
//         if(err){
//             console.log(err)
//         }
//     })
    
//     if(message.channel.id === '677624287649333268' || message.channel.id === '678701864514224170' || message.channel.id === '624327775935004687') {
//         if(/Нода дай монеток$|!монетки/i.test(message.content)){
//             u.coins += 100;
//             let pushCoins = new Discord.RichEmbed()
//             .setTitle(`Запрос халявных монеток`)
//             .setColor(0x36D904)
//             .setDescription(`
//             Держи 100 монеток :moneybag:
//             Чеканных монет: ${userLvl[uid].coins} 
//             `);
//             message.channel.send(pushCoins);
//         }
//     }
// }

module.exports.help = {
    name: "userlvl"
};
