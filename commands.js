const regex = require('./regex')
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');

async function executeCommand(message, user, query) {
    // Buy questions guide
    if (regex.buy_question.test(message.content)) {
        console.log(`Noda / MSG / HM / Buy question info`);
        const shop = new RichEmbed()
            .setTitle(`Нода-шоп!`)
            .setColor(0xebe134)
            .setDescription(`
            Ваш баланс монет: ${user.coins}
            Купить общий вопрос: 25 чеканных монет
            Купить личный вопрос: 100 чеканных монет

            Для покупки общего вопроса напишите: !общий вопрос
            Для покупки личного вопроса напишите: !личный вопрос
            `);
        message.channel.send(shop);
    // Buy common_questions guide
    } else if (regex.buy_common_question.test(message.content)) {
        console.log(`Noda / MSG / HM / Buy common question info`);
        if(coins >= 25){
            const commonQuestion = new RichEmbed()
            .setTitle(`Покупка общего вопроса.`)
            .setColor(0xebe134)
            .setDescription(`
            Ваш баланс монет: ${user.coins}
            Для покупки вопроса напишите или лучше скопируйте как шаблон:
            !вопрос [Тут пишите ваш вопрос, обязательно в квадратных скобочках] [А тут ваш ответ, так же в квадратных скобочках]
            `);
            message.channel.send(commonQuestion);
        } else {
            const commonQuestionFalse = new RichEmbed()
            .setTitle(`Отказано.`)
            .setColor(0xFF0000)
            .setDescription(`
            Не хватает чеканных монет, ваш баланс: ${user.coins}
            `);
            message.channel.send(commonQuestionFalse);
        }  
    // Buy personal_question guide 
    } else if (regex.buy_personal_question.test(message.content)) {
        console.log(`Noda / MSG / HM / Buy personal question info`);
        if(coins >= 100){
            let plate = new RichEmbed()
            .setTitle(`Покупка личного вопроса.`)
            .setColor(0xebe134)
            .setDescription(`
            Ваш баланс монет: ${user.coins}
            Для покупки вопроса напишите или лучше скопируйте как шаблон:
            !вопрос [Тут пишите ваш вопрос, обязательно в квадратных скобочках] [А тут ваш ответ, так же в квадратных скобочках] [личный]
            `);
            message.channel.send(plate);
        } else {
            let plate_false = new RichEmbed()
            .setTitle(`Отказано.`)
            .setColor(0xFF0000)
            .setDescription(`
            Не хватает чеканных монет, ваш баланс: ${user.coins}
            `);
            message.channel.send(plate_false);
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
                let plate = new RichEmbed()
                .setTitle(`Ошибка`)
                .setColor(0xFF0000)
                .setDescription(`
                Вы неправильно указали тип вопроса.
                Для покупки личного вопроса, в конце оформления покупки обычного вопроса допишите [личный].
                Для покупки общего вопроса можно вообще не писать тип вопроса или напишите [общий]
                `)
                bot.send(plate);
                return;
            }
            user.questions += 1;
            console.log(`Noda / MSG / HM / BQ / Q: '${user.question}', A: '${user.answer}', T: '${user.question_type}'`);
            const commonQuestionBye = new RichEmbed()
            .setTitle(`Покупка оформлена.`)
            .setColor(0x36D904)
            .setDescription(`
            Ваш вопрос: ${user.question}
            Ваш ответ: ${user.answer}
            Тип вопроса: ${user.question_type === 0 ? 'общий' : 'личный'}
            Осталось чеканных монет: ${user.coins}
            Приятного использования😘
            `);
            message.channel.send(commonQuestionBye);
        } else {
            console.log(`Noda / MSG / HM / Not enough money for a common question`);
            message.channel.send(`${args.length >= 2 ? 'Не хватает чеканных монет, ваш баланс:' + user.coins : 'Вы неправильно написали шаблон для покупки вопроса, можете посмотреть правильные шаблоны, написав "!купить общий вопрос" или "!купить личный вопрос"'}`);
        }
    // Show profiles
    } else if (regex.show_profile.test(message.content)) {
        console.log(`Noda / MSG / HM / Show profiles`);
        try {
            let embed = new RichEmbed()
            .setTitle(`Профиль игрока: ${user.server_name}`)
            .setColor(0x0a4bff)
            .setDescription(`
            :trophy:LVL: ${user.lvl}
            :jigsaw:XP: ${user.exp}
            :moneybag:Чеканных монет: ${user.coins}
            :key:Общих вопросов куплено: ${user.questions}
            `)
            .setThumbnail(user.avatar)
            message.channel.send(embed);
        } catch (error) {
            let embed = new RichEmbed()
            .setTitle(`Профиль игрока: ${user.user_name}`)
            .setColor(0x0a4bff)
            .setDescription(`
            :trophy:LVL: ${user.lvl}
            :jigsaw:XP: ${user.exp}
            Чеканных монет: ${user.coins} :moneybag:
            :key:Общих вопросов куплено: ${user.questions}
            `)
            .setThumbnail(user.avatar)
            message.channel.send(embed);
        }
    // Throw a cube
    } else if (regex.cube.test(message.content)) {
        console.log(`Noda / MSG / HM / Throw a cube`);
        message.channel.send(Math.ceil(Math.random() * 10)); 
    } else if (regex.money.test(message.content)) {
        console.log(`Noda / MSG / HM / QN / Give some coins`);
        // give 100 coins
        user.coins += 100;
        let pushCoins = new RichEmbed()
        .setTitle(`Запрос халявных монеток`)
        .setColor(0x36D904)
        .setDescription(`
        Держи 100 монеток :moneybag:
        Чеканных монет: ${user.coins} 
        `);
        message.channel.send(pushCoins);
    } else {
        message.channel.send('Не надо мной командовать, окей?!');
    }
}

module.exports.exec = executeCommand;