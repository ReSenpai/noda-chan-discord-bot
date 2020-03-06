const bj = require('engine-blackjack');
const regex = require('./regex.js');
const actions = bj.actions;
const Game = bj.Game;
const getRules = bj.presets.getRules;

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

function action(cmd, num, state, coins) {
    const game = new Game(null, getRules({insurance: false, split: false}));
    // console.dir(game.state);
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
                // game.dispatch(actions.hit('right'));
                console.log('Double')
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
    let langRus = true;
    let bet = state.finalBet?state.finalBet:state.initialBet;
    let dealerHand = state.dealerCards?visualizeHand(state.dealerCards):`${langRus ? 'Нет карт' : 'No cards'}`;
    let yourHand = state.handInfo.right.cards?visualizeHand(state.handInfo.right.cards):`${langRus ? 'Нет карт' : 'No cards'}`;
    const check = (state.stage === 'player-turn-right' || state.stage === 'done');
    let dealer_hi = check ? state.dealerValue.hi : 0;
    let dealer_lo = check ? state.dealerValue.lo : 0;
    let your_hi = check ? state.handInfo.right.playerValue.hi : 0;
    let your_lo = check ? state.handInfo.right.playerValue.lo : 0;
    let str = '';
    let color = 0x34363C;
    let smile1 = '<:389519879809531906:677626911295537173>';
    let smile2 = '<:389519853373095937:677623986007310377>';
    if(state.stage === 'done') {
        coins += state.wonOnRight;
        if(!state.wonOnRight)
            str += `Поражение, попращайтесь с ${state.finalBet} монетками ${smile1}\n\n`;
        else
            str += `Победа ${smile2} Ваш выйгрыш: ${state.wonOnRight}\n`;
        color = state.wonOnRight === 0 ? 0xFF0000 : 0x36D904;
        state = {};
    }
    if(langRus) {
        let dealer_sum = dealer_hi === dealer_lo ? dealer_hi : (`от ${dealer_lo} до ${dealer_hi} (Есть туз)`);
        let your_sum = your_hi === your_lo ? your_lo : (`от ${your_lo} до ${your_hi} (Есть туз)`);
        str += `Монетки: ${coins} | Ставка ${bet} 
            Рука Ноды | Сумма карт: ${dealer_sum} 
            ${dealerHand} 
            Ваша рука | Сумма карт: ${your_sum}
            ${yourHand}`;
    } else {
        str += `Coins: ${coins}, Bet: ${bet}\nNoda:\n\t${dealerHand}\nYou:\n\t${yourHand}`;
    }
    return {str, state, coins, color};
}

module.exports = action;