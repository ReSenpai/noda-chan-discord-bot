const data = require('../two_bots.json');
const update = require('../two_bots.json');
const fs = require('fs');

async function twoBots(message) {
    // Start dialoge
    if (message.author.id === '677662460748234762') {
        console.log(`${data.randomNoda} - рандом НОДЫ`);
        console.log(`${data.start.noda[data.randomNoda]} - сообщение НОДЫ`);
        const random = Math.ceil((Math.random() * data.start.kun[data.randomNoda].length) - 1);
        update.randomKun = random;
        let bot_message = data.start.kun[data.randomNoda][random];

        console.log(`${random} - рандом КУНА`)
        console.log(`${bot_message} - сообщение КУНА`)
        
        fs.writeFile('../two_bots.json', JSON.stringify(update, null, 2),(err) => {
            if(err) console.log(err);
        });
    
        if (message.content === data.start.noda[data.randomNoda]) {
            setTimeout(() => message.channel.send(bot_message), 3000);
        }
    } else {
        return;
    }
}

module.exports.twoBots = twoBots;