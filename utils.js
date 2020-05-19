const natural = require('natural');
const queries = require('./queries');
const { Attachment, RichEmbed, Emoji, Guild, Client, MessageReaction, Discord, GuildEmoji} = require('discord.js');


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
        user.server_name = message.author.username;
    }
    user.user_name = message.author.username;
    user.avatar = message.author.avatarURL;
}


// string format
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    });
  };
}


function sendMessage(message, obj, title_pars = [], desc_pars = [], footer_pars = [], thumbnail = '', fields = []) {
    const rich_message = new RichEmbed()
            .setTitle(obj.title.format(...title_pars))
            .setColor(obj.color)
            .setDescription(obj.description.format(...desc_pars))
            .setFooter(obj.footer.format(...footer_pars))
            .setThumbnail(thumbnail);
    for (field of fields) {
        rich_message.addField(...field);
    }
    message.channel.send(rich_message);
}


module.exports = {stemming, rndAnswer, updUserInfo, getDiscordInfo, sendMessage};