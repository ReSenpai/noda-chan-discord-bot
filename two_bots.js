
const data = require('./two_bots.json');
const update = require('./two_bots.json');
const fs = require('fs');

async function twoBots(message, user) {
    // Start dialoge
    console.log(`Noda / TWO_BOTS / start`);
    const random = Math.ceil((Math.random() * 10) - 1);
    update.randomNoda = random;
    let bot_message = data.start.noda[random];

    console.log(data.randomNoda);
    console.log(data.randomKun);

    fs.writeFile('./two_bots.json', JSON.stringify(update, null, 2), function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(update));
        console.log(data);
      });

    setTimeout(() => message.channel.send(bot_message), 3000);
}

module.exports.twoBots = twoBots;