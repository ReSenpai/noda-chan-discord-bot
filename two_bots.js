
const data = require('./two_bots.json');
const update = require('./two_bots.json');
const fs = require('fs');

async function twoBots(message, user) {
    // Start dialoge
    console.log(`Noda / TWO_BOTS / start`);
    const random = Math.ceil((Math.random() * 10) - 1);
    update.randomNoda = random;
    let bot_message = data.start.noda[random];

    fs.writeFile('./two_bots.json', JSON.stringify(update, null, 2),(err) => {
        if(err) console.log(err);
    });

    setTimeout(() => message.channel.send(bot_message), 3000);
    console.log(data.randomNoda);
}

module.exports.twoBots = twoBots;