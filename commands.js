const regex = require('./regex')
const { Attachment, RichEmbed, Emoji, Guild, Client, MessageReaction, Discord, GuildEmoji} = require('discord.js');
const bj = require('./blackjack');
const queries = require('./queries');
const discord = require('discord.js');
const guild = new discord.Guild();
const two_bots = require('./two_bots');
const utils = require('./utils');
const messages = require('./messages.js')

async function executeCommand(message, user, query) {
    // Buy questions guide
    if (regex.buy_question.test(message.content)) {
        console.log(`Noda / MSG / HM / Buy question info`);
        utils.sendMessage(message, messages.buy_question, [], [user.coins], []);
    // Buy common_questions guide
    } else if (regex.buy_common_question.test(message.content)) {
        console.log(`Noda / MSG / HM / Buy common question info`);
        if(user.coins >= 25){
            utils.sendMessage(message, messages.buy_common_question, [], [user.coins], []);
        } else {
            utils.sendMessage(message, messages.buy_question_den, [], [user.coins], []);
        }  
    // Buy personal_question guide 
    } else if (regex.buy_personal_question.test(message.content)) {
        console.log(`Noda / MSG / HM / Buy personal question info`);
        if(user.coins >= 100){
            utils.sendMessage(message, messages.buy_personal_question, [], [user.coins], []);
        } else {
            utils.sendMessage(message, messages.buy_question_den, [], [user.coins], []);
        }  
    // calculate
    } else if (regex.calculate.test(message.content)) {
        let args = message.content.split(' ');
        args.splice(0, 1);
        let check = true;
        args.forEach(element => {
            if (regex.blacklist_calc.test(element)) {
            } else {
                check = false;
            }
        });
        if (check) {
            let result = eval(args.join(''));
            if (result % 1 === 0) {  
                message.channel.send(result);
            } else {
                message.channel.send(result.toFixed(2));
            }
        } else {
            message.channel.send('Херню написал');
        }
    // converter
    } else if (regex.leaves.test(message.content)) {
        let args = message.content.split(' ');
        let result = (args[1] * 0.54);
        if (result >= 100) {
            console.log(result / 100)
            message.channel.send(`Будет стоить ${(result / 100).toFixed(2)} брюля`);
        } else {
            message.channel.send(`Будет стоить ${result.toFixed(2)} голды`);
        }
    // Daily
    } else if (regex.daily.test(message.content)) {
        const now_time = new Date();
        let check = false;
        const user_time = () => Math.ceil((now_time.getTime() - user.daily_time.getTime()) / 1000);

        if (user.daily_time === null) {
            user.daily_time = now_time
            check = true;
        } else if (user_time() < 86400) { 
            check = false;
        } else {
            user.daily_time = now_time
            check = true;
        }

        if (check) {
            user.coins += 50
            utils.sendMessage(message, messages.daily_message, [], [], [user.coins]);
        } else {
            const time = 86400 - user_time();
            console.log(time);
            const seconds = ('0' + Math.floor( time % 60 )).slice(-2);
            const minutes = ('0' + Math.floor( (time / 60) % 60 )).slice(-2);
            const hours = Math.floor( (time/(60*60)) % 24 );
            utils.sendMessage(message, messages.daily_message_den, [], [hours, minutes, seconds], []);
        }
    // buy questions with code
    } else if (regex.just_question.test(message.content)) {
        console.log(`Noda / MSG / HM / BQ / Buy a question!`);
        let args = message.content.split(" [");
        if (user.coins >= 25 && args.length >= 2) {
            console.log(`Noda / MSG / HM / BQ / Enough money for a common question and the question has proper structure`);
            user.question = args[1].slice(0, -1);
            user.answer = args[2].slice(0, -1);
            try {
                user.question_type = args[3].slice(0, -1);
            } catch (error) {
                user.question_type = 0;
            }
            console.log(`Noda / MSG / HM / BQ / Question type ${user.question_type}`);
            if (regex.personal_question.test(user.question_type)) {
                if (user.coins >= 100) {
                    console.log(`Noda / MSG / HM / BQ / Personal question was bought`);
                    user.question_type = 1;
                    user.coins -= 100;
                } else {
                    console.log(`Noda / MSG / HM / BQ / Not enough money for personal question`);
                    bot.send(`Не хватает чеканных монет для покупки личного вопроса.\nВаш баланс: ${user.coins} монет!`)
                    return;
                }
            } else if (user.question_type === 0 || common_question.test(user.question_type)) {
                console.log(`Noda / MSG / HM / BQ / Common question was bought`);
                user.question_type = 0;
                user.coins -= 25;
            } else {
                console.log(`Noda / MSG / HM / BQ / Incorrect question type`);
                utils.sendMessage(message, messages.inc_question, [], [], []);
                return;
            }
            user.questions += 1;
            console.log(`Noda / MSG / HM / BQ / Q: '${user.question}', A: '${user.answer}', T: '${user.question_type}'`);
            utils.sendMessage(message, messages.quest_bought, [], [
                user.question, 
                user.answer, 
                user.question_type === 0 ? 'общий' : 'личный',
                user.coins,
            ], []);
        } else {
            console.log(`Noda / MSG / HM / Not enough money for a common question`);
            message.channel.send(`${args.length >= 2 ? 'Не хватает чеканных монет, ваш баланс:' + user.coins : 'Вы неправильно написали шаблон для покупки вопроса, можете посмотреть правильные шаблоны, написав "!купить вопрос"'}`);
        }
    // Show profiles
    } else if (regex.show_profile.test(message.content)) {
        console.log(`Noda / MSG / HM / Show profiles`);
        utils.sendMessage(message, messages.profile, [user.server_name?user.server_name:user.user_name], [
            user.lvl, 
            user.exp, 
            user.coins,
            user.questions
        ], [], user.avatar);
    // Throw a cube
    } else if (regex.cube.test(message.content)) {
        console.log(`Noda / MSG / HM / Throw a cube`);
        message.channel.send(Math.ceil(Math.random() * 10)); 
    } else if (regex.money.test(message.content)) {
        console.log(`Noda / MSG / HM / QN / Give some coins`);
        // give 100 coins
        user.coins += 100;
        utils.sendMessage(message, messages.give_coins, [], [user.coins], []);
    } else if (/^!bj|^!бж/i.test(message.content)) {
        console.log('Noda / MSG / BJ');
        if (/^!bj$|^!бж$/i.test(message.content)) {
            utils.sendMessage(message, messages.bj, [], [], []);
        } else {
            try {
                const bj_data = await query(queries.sql_get_bj_state, [user.uid]);
                let state = {};
                try {
                    state = JSON.parse(bj_data[0]['state']);
                } catch (error) {
                    state = {};
                }
                let words = message.content.split(' ');
                let cmd = words[1];
                let num = words.length==3?parseInt(words[2]):-1;
                let turn = bj(cmd, num, state, user.coins);
                user.coins = turn.coins;
                let stateJSON = JSON.stringify(turn.state);
                query(queries.sql_upd_bj_state, [user.uid, stateJSON, stateJSON]);
                if (turn.result_value === 0 || turn.result_value === 1) {
                    // lol
                    utils.sendMessage(message, {
                        'title': `Блэкджек | ${ user.server_name ? user.server_name : user.user_name }`,
                        'color': turn.color,
                        'description': `${ turn.result_value ? turn.result : turn.command }`,
                        'footer': turn.footer,
                    }, [], [], [], '', [
                        [turn.noda_hand, turn.noda_hand_cards, true],
                        [turn.you_hand, turn.you_hand_cards, turn.result_value === 0 ? true : false],
                    ]);
                } else if (turn.result_value === 2) {
                    utils.sendMessage(message, messages.bj_no_money, [], [user.coins], []);
                } else if (turn.result_value === 3) {
                    utils.sendMessage(message, messages.bj_no_money_double, [], [user.coins], []);
                } else if (turn.result_value === 4) {
                    utils.sendMessage(message, messages.bj_inc_bet, [], [], []);
                } else if (turn.result_value === 5) {
                    utils.sendMessage(message, messages.bj_help, [], [], []);
                } else if (turn.result_value === 'surrender') {
                    utils.sendMessage(message, messages.bj_surrender_er, [], [], []);
                } else if (turn.result_value === 'double') {
                    utils.sendMessage(message, messages.bj_double_er, [], [], []);
                }
                message.channel.send(bj_message);
            } catch (error) {
                console.log('Noda / MSG / BJ / Error');
                console.log(error);
            }
        }
    } else if (regex.help.test(message.content)) {
        utils.sendMessage(message, messages.help, [], [], []);
    } else if (regex.two_bots.test(message.content)) {
        await two_bots.twoBots(message, user);
    } else {
        message.channel.send('Не надо мной командовать, окей?!');
    }
}

module.exports.exec = executeCommand;