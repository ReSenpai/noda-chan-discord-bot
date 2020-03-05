const black_jack = require('engine-blackjack');
const actions = black_jack.actions;
const Game = black_jack.Game;
const prompt = require('prompt-sync')({sigint: true});

const game = new Game();

while(true) {
    let state = game.getState();
    // console.log('======================================================================');
    // console.dir(state);
    // console.log('======================================================================');
    console.log(`stage: ${state.stage}, won: ${state.wonOnRight}, final win: ${state.finalWin}, initial bet: ${state.initialBet}, final bet: ${state.finalBet}`)
    console.log('Your hand: ')
    console.log(state.handInfo.right.cards);
    console.log('Dealer hand: ')
    console.log(state.dealerCards);
    console.log('Dealer hole card: ');
    console.log(state.dealerHoleCard);

    const cmd = prompt('Your turn: ');
    switch(cmd) {
        // раздать карты
        case 'deal':
            game.dispatch(actions.deal(10))
            break;
        // забрать пол ставки и сдаться
        case 'surrender':
            game.dispatch(actions.surrender())
            break;
        // взять карту
        case 'hit':
            game.dispatch(actions.hit('right'))
            break;
        // больше карт не нужно
        case 'stand':
            game.dispatch(actions.stand('right'))
            break;
    }
}