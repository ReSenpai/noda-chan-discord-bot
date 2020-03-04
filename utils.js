const natural = require('natural');
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

module.exports.stemming = stemming;
module.exports.nodaAnsw = nodaAnsw;
module.exports.confusedAnsw = confusedAnsw;
module.exports.rndAnswer = rndAnswer;