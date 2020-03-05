const natural = require('natural');
const queries = require('./queries');

const black_jack = require('engine-blackjack')
const actions = black_jack.actions
const Game = black_jack.Game


async function blackjack(message, bot) {
    const game = new Game('♠10 ♦1 ♥5 ♣6 ♠11 ♦10')
    if (message.content == 'тест') {
        // message.channel.send(game.state);
        console.log(game.state);
    }
}

module.exports.game = blackjack;