const natural = require('natural');
const queries = require('./queries');

const black_jack = require('engine-blackjack')
const actions = black_jack.actions
const Game = black_jack.Game


async function blackjack(message, bot) {
    const game = new Game()
    if (message.content == 'тест') {
        // message.channel.send(game.state);
        // console.log(game.state);
        // stage is "ready"
        console.log(game.getState().stage)

        // call an action to mutate the state
        game.dispatch(actions.deal());

        // stage has changed
        console.log(game)
    }
}

module.exports.game = blackjack;