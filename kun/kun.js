const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const fs = require('fs');
let config = require('./botconfig.json');
let token = config.token;
const two_bots = require('./two_bots.js');

bot.on('ready', () => {
    console.log(`Запустился бот ${bot.user.username}`);
    bot.generateInvite(["ADMINISTRATOR"]).then(link =>{
        console.log(link);
    });
});

bot.on('message', async message => {
    if(message.channel.type == "dm") return;
    bot.send = function (msg){
        message.channel.send(msg);
    };
    
    if(message.author.bot) {
        await two_bots.twoBots(message);
    }
});


bot.login(token);