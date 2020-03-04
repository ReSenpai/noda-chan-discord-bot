const natural = require('natural');
const queries = require('./queries');

// russian stemming
var tokenizer = new natural.WordTokenizer();
function stemming(str) {
    let words = tokenizer.tokenize(str);
    let stems = [];
    for (word of words) {
        stems.push(natural.PorterStemmerRu.stem(word));
    }
    str_stemmed = stems.join(' ')
    console.log(`Noda / Stemmed / ${str_stemmed}`);
    return str_stemmed;
}

let nodaAnsw = [    'Шито?', 
                    'Отстань, я занята...', 
                    'Ну шо такое?', 'Хватит меня звать ._.', 
                    'Ваще то моё полное имя - Нода тян',
                    'Ась?',
                    'Шо надо то?',
                    'Слушаю:3',
                    'Как банный лист пристал...'];

let confusedAnsw = ['Cложно, сложно, ни**я не понятно.',
                    'Чееего *лять?',
                    'Ни**я не поняла, но очень интересно:3',
                    'Чот я ничего не поняла',
                    'А можно помедленее? Я записываю...'];
                    
function rndAnswer(answers) {
    return answers[Math.ceil(Math.random() * answers.length)];
}

async function updUserInfo(message, user, query) {
    // if the user created a question
    if (user.question && user.answer) {
        console.log(`Noda / MSG / HM / Add bought question into DB`);
        // add question to table questions
        let add_question = await query(queries.sql_add_question, [stemming(user.question)]);
        let question_id = add_question.insertId;

        // add answer to table answers
        let add_answer = await query(queries.sql_add_answer, [user.answer]);
        let answer_id = add_answer.insertId;

        // link added question and added answer in table conn_quest_ans
        query(queries.sql_connect_question, [question_id, answer_id, user.uid, user.question_type]);
    }
}

function getDiscordInfo(message, user, query) {
    // user info from discord
    user.uid = message.author.id;
    user.server_name = '';
    try {
        user.server_name = message.member.nickname;
    } catch (error) {
        // name for direct questions
        user.server_name = 'whisperer';
    }
    user.user_name = message.author.username;
    user.avatar = message.author.avatarURL;
}

module.exports = {stemming, nodaAnsw, confusedAnsw, rndAnswer, updUserInfo, getDiscordInfo};