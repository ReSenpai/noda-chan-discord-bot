const bj = require('./blackjack');

const prompt = require('prompt-sync')({sigint: true});
let state = {};

while(true) {
    try {
        const message = prompt('Your turn: ');
        let words = message.split(' ');
        let cmd = words[0];
        let num = words.length==2?parseInt(words[1]):-1;
        let turn = bj(cmd, num, state);
        console.log(turn.str);
        state = turn.state;
    } catch (error) {
        console.log(error);
    }
}