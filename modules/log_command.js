const config = require('../config.json');
const prefix = config.prefix;

//- Команды для сбора логов в консольку

module.exports.run = async(message,bot) => {
    if(message.content === `${prefix}id`){  //- посмотреть id юзера, он должен сам писать
        console.log(message.author.id);
        message.channel.send('Ок, я увидела твой id');
    }else if(message.content === `${prefix}log`){  //- Посмотреть объект юзера
        console.log(message.author);
        message.channel.send('Логи собраны');
    }else if(message.content === `${prefix}channelid`){  //- Посмотреть id канала
        message.channel.send('id канала собрано');
        console.log(message.channel.id)
    }
}

module.exports.help = {
    name: ['id','log','channelid','link']
};