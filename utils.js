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

module.exports.stemming = stemming;