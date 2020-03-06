const bj = require('engine-blackjack');
const regex = require('./regex.js');
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
    switch(true) {
        // раздать карты
        case regex.deal.test(cmd):
            if (num > 0 && coins >= num) {
                game.dispatch(actions.deal({ bet: num, sideBets: { luckyLucky: 0 } }));
                coins -= num;
            } else {
                console.log('incorrect ammount - deal');
            }
            break;
        // забрать пол ставки и сдаться
        case regex.surrender.test(cmd):
            game.dispatch(actions.surrender());
            break;
        // взять карту
        case regex.hit.test(cmd):
            game.dispatch(actions.hit('right'));
            break;
        // больше карт не нужно
        case regex.stand.test(cmd):
            game.dispatch(actions.stand('right'));
            break;
        // удвоить ставку после разлачи
        case regex.double.test(cmd):
            if (coins >= state.initialBet) {
                coins -= state.initialBet;
                game.dispatch(actions.double('right'));
            } else {
                console.log('Not enough coins');
            }
            break;
        // застраховать руку, если диллеру пришел туз первой картой
        case regex.insurance.test(cmd):
            if (num >= 0)
                game.dispatch(actions.insurance(num));
            else
                console.log('incorrect ammount');
            break;
    }
    state = game.getState();
    let bet = state.finalBet?state.finalBet:state.initialBet;
    let dealerHand = state.dealerCards?visualizeHand(state.dealerCards):`${true ? 'Нет карт' : 'No cards'}`;
    const check = (state.stage === 'player-turn-right' || state.stage === 'done');
    var dealer_value_hi = check ? state.dealerValue.hi : 0;
    let dealer_value_lo = check ? state.dealerValue.lo : 0;
    let your_value_hi = check ? state.handInfo.right.playerValue.hi : 0;
    let your_value_lo = check ? state.handInfo.right.playerValue.lo : 0;
    let yourHand = state.handInfo.right.cards?visualizeHand(state.handInfo.right.cards):`${true ? 'Нет карт' : 'No cards'}`;
    let str = '';
    let color = 0x34363C;
    if(state.stage === 'done') {
        coins += state.wonOnRight;
        str += (state.wonOnRight === 0 ? `Поражение, попращайтесь с ${state.finalBet} монетками <:389519879809531906:677626911295537173>\n\n` : `Победа<:389519853373095937:677623986007310377>  Ваш выйгрыш :${state.wonOnRight} \n`);
        color = state.wonOnRight === 0 ? 0xFF0000 : 0x36D904;
        console.log(state);
        state = {};
    }
    str += (true ? `Монетки: ${coins} | Ставка ${bet} \nРука Ноды | Сумма карт: ${dealer_value_hi === dealer_value_lo ? dealer_value_hi : dealer_value_hi + ' или ' + dealer_value_lo + ' (Есть туз)' } \n\t${dealerHand} \nВаша рука | Сумма карт: ${your_value_hi === your_value_lo ? your_value_lo : your_value_hi + ' или ' + your_value_lo + ' (Есть туз)' } \n\t${yourHand}` : `Coins: ${coins}, Bet: ${bet}\nNoda:\n\t${dealerHand}\nYou:\n\t${yourHand}`);
    return {str, state, coins, color};
}

module.exports = action;