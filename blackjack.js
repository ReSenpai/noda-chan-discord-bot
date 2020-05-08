const bj = require('engine-blackjack');
const regex = require('./regex.js');
const consts = require('./consts.js');
const RichEmbed = require('discord.js');
const actions = bj.actions;
const Game = bj.Game;
const getRules = bj.presets.getRules;

function visualizeCart(cart) {
    let suite = '';
    switch(cart.suite) {
        case 'diamonds':
            suite = '\u2666';
            break;
        case 'hearts':
            suite = '\u2665';
            break;
        case 'clubs':
            suite = '\u2663';
            break;
        case 'spades':
            suite = '\u2660';
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

function richEmbedConstructor(...templates) {
    let bj_message = new RichEmbed()
    templates === 'title' ? bj_message.setTitle() : '' 
    .setColor()
    templates === 'description' ? bj_message.setDescription() : ''
    templates === 'field' ? bj_message.addField() : ''
    templates === 'field_2' ? bj_message.addField() : ''
    templates === 'field_2' ? bj_message.addField() : ''
    templates === 'footer' ? bj_message.setFooter() : ''

}

function action(cmd, num, state, coins) {
    const game = new Game(null, getRules({insurance: false, split: false}));
    let result_value = 0;
    // console.dir(game.state);
    if (cmd == 'reset') {
        state = {};
    } else if(state)
        game.setState(state);
        switch(true) {
            // раздать карты
            case regex.deal.test(cmd):
                console.log(cmd);
                num = parseInt(cmd) > 0 ? parseInt(cmd) : -1;
                console.log(num);
                if (num > 0 && coins >= num) {
                    game.dispatch(actions.deal({ bet: num, sideBets: { luckyLucky: 0 } }));
                    coins -= num;
                    console.log('i am here')
                } else if (num <= 0) {
                    result_value = 4;
                } else {
                    result_value = 2;
                    console.log('incorrect ammount - deal');
                }
                break;
            // забрать пол ставки и сдаться
            case regex.surrender.test(cmd):
                game.dispatch(actions.surrender());
                state.handInfo.right.availableActions.surrender ? result_value = 0 : result_value = 'surrender';
                break;
            // взять карту
            case regex.hit.test(cmd):
                game.dispatch(actions.hit('right'));
                break;
            // больше карт не нужно
            case regex.stand.test(cmd):
                game.dispatch(actions.stand('right'));
                break;
            // удвоить ставку после раздачи
            case regex.double.test(cmd):
                if (coins >= state.initialBet) {
                    coins -= state.initialBet;
                    game.dispatch(actions.double('right'));
                    state.handInfo.right.availableActions.double ? result_value = 0 : result_value = 'double';
                    console.log('Double')
                } else {
                    result_value = 3;
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
            case regex.bj_help.test(cmd):
                result_value = 5;
                break;
            // плашка для неверной команды
            default:
                result_value = 5;
                break;
    }
    state = game.getState();
    console.log(state.handInfo.right.availableActions);
    let langRus = true;
    let bet = state.finalBet?state.finalBet:state.initialBet;
    let dealerHand = state.dealerCards?visualizeHand(state.dealerCards):`${langRus ? 'Нет карт' : 'No cards'}`;
    let yourHand = state.handInfo.right.cards?visualizeHand(state.handInfo.right.cards):`${langRus ? 'Нет карт' : 'No cards'}`;
    const check = (state.stage === 'player-turn-right' || state.stage === 'done');
    let dealer_hi = check ? state.dealerValue.hi : 0;
    let dealer_lo = check ? state.dealerValue.lo : 0;
    let your_hi = check ? state.handInfo.right.playerValue.hi : 0;
    let your_lo = check ? state.handInfo.right.playerValue.lo : 0;
    let noda_hand = '';
    let noda_hand_cards = '';
    let you_hand = '';
    let you_hand_cards = '';
    let footer = '';
    let command = '';
    let result = '';
    let color = 0x202225;
    let smile1 = ':smile: ';
    let smile2 = ':smirk:';
    if(state.stage === 'done') {
        your_winning = Math.floor(state.wonOnRight);
        coins += your_winning;
        if(!your_winning) {
            result = `Поражение, попращайтесь с ${state.finalBet} монетками ${smile1}\n`
            result_value = 1;
        } else {
            result = `Победа ${smile2} Ваш выйгрыш: ${your_winning}\n`;
            result_value = 1;
        }
        color = your_winning === 0 ? 0xEF5350 : 0x009900;
        state = {};
    }
    if(langRus) {
        let dealer_sum = dealer_hi === dealer_lo ? dealer_hi : (`от ${dealer_lo} до ${dealer_hi} (Есть туз)`);
        let your_sum = your_hi === your_lo ? your_lo : (`от ${your_lo} до ${your_hi} (Есть туз)`);
        command = `
            \`!бж еще\` взять карту, \`!бж хватит\` - закончить ход,
            \`!бж пас\` выйти, \`!бж удвоить\` для удвоения`;
        noda_hand = `
            \n\nРука ноды`;
        noda_hand_cards = `
            ${dealerHand}
            Счёт: ${dealer_sum}`
        you_hand = `
            \nВаша рука`
        you_hand_cards = `
            ${yourHand}
            Счёт: ${your_sum}`
        footer = `Ставка: ${bet}  |  Ваши монетки: ${coins}`;
    } else {
        str += `Coins: ${coins}, Bet: ${bet}\nNoda:\n\t${dealerHand}\nYou:\n\t${yourHand}`;
    }
    return {state, coins, color, footer, command, noda_hand, noda_hand_cards, you_hand, you_hand_cards, result, result_value};
}

module.exports = action;