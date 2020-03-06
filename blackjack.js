const bj = require('engine-blackjack');
const actions = bj.actions;
const Game = bj.Game;
// const prompt = require('prompt-sync')({sigint: true});

function visualizeCart(cart) {
    let suite = '';
    switch(cart.suite) {
        case 'diamonds':
            suite = '\u2666';
            //suite = '\u2662';
            break;
        case 'hearts':
            suite = '\u2665';
            //suite = '\u2661';
            break;
        case 'clubs':
            suite = '\u2663';
            //suite = '\u2667';
            break;
        case 'spades':
            suite = '\u2660';
            //suite = '\u2664';
            break;
    }
    return `${suite}${cart.text}`;
}

function visualizeHand(hand) {
    hand_text = '';
    for(let cart of hand) {
        hand_text += visualizeCart(cart) + '\t';
    }
    return hand_text.slice(0, -1);
}

function getHandScore(hand) {
    let score = 0;
    for(let cart of hand) {
        score += cart.value;
    }
    return score;
}

function action(cmd, num, state, coins) {
    const game = new Game();
    if (cmd == 'reset') {
        state = {};
    } else if(state)
        game.setState(state);
    switch(cmd) {
        // раздать карты
        case 'deal':
            if (num > 0 && coins >= num) {
                game.dispatch(actions.deal({ bet: num, sideBets: { luckyLucky: 0 } }));
                coins -= num;
            } else {
                console.log('incorrect ammount');
            }
            break;
        // забрать пол ставки и сдаться
        case 'surrender':
            game.dispatch(actions.surrender());
            break;
        // взять карту
        case 'hit':
            game.dispatch(actions.hit('right'));
            break;
        // больше карт не нужно
        case 'stand':
            game.dispatch(actions.stand('right'));
            break;
        // удвоить ставку после разлачи
        case 'double':
            if (coins >= state.initialBet) {
                coins -= state.initialBet;
                game.dispatch(actions.double('right'));
            } else {
                console.log('Not enough coins');
            }
            break;
        // застраховать руку, если диллеру пришел туз первой картой
        case 'insurance':
            if (num >= 0)
                game.dispatch(actions.insurance(num));
            else
                console.log('incorrect ammount');
            break;
    }
    state = game.getState();
    let bet = state.finalBet?state.finalBet:state.initialBet;
    let dealerHand = state.dealerCards?visualizeHand(state.dealerCards):'No carts';
    let yourHand = state.handInfo.right.cards?visualizeHand(state.handInfo.right.cards):'No carts';
    let str = '';
    if(state.stage === 'done') {
        coins += state.wonOnRight;
        str += `GAME HAS ENDED YOUR REWARD IS ${state.wonOnRight}$\n\n`;
        state = {};
    }
    str += `Coins: ${coins}, Bet: ${bet}\nNoda:\n\t${dealerHand}\nYou:\n\t${yourHand}`;
    return {str, state, coins};
}

module.exports = action;