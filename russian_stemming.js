const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

const stemming = function(str) {
    const words = tokenizer.tokenize(str);
    const stems = [];
    for (word of words) {
        stems.push(natural.PorterStemmerRu.stem(word));
    }
    str_stemmed = stems.join(' ')
    console.log(`Noda / Stemmed / ${str_stemmed}`);
    return str_stemmed;
}

module.exports = stemming;