const regex = require('./regex')
const utils = require('./utils')
const queries = require('./queries');
const { Attachment, RichEmbed, Emoji, Guild, Client } = require('discord.js');

async function handleQuestion(message, user, query) {
    // "Нода ..."
    if(regex.noda.test(message.content)){
        console.log(`Noda / MSG / HM / Bot's name`);
        message.channel.send(utils.rndAnswer(utils.nodaAnsw));
    } else if (regex.question.test(message.content)) {
        console.log(`Noda / MSG / HM / QN / Question to Noda`);
        console.log(`Noda / MSG / HM / QN / Find the question in DB`);
        // find the closest questions in DB
        console.time('Noda / MSG / HM / QN / Question search time');
        matched_questions = await query(queries.sql_find_question, [utils.stemming(message.content), user.uid]);
        console.timeEnd('Noda / MSG / HM / QN / Question search time');
        console.time('Noda / MSG / HM / QN / Answer time');
        // if questions exist
        if(matched_questions) {
            console.log(`Noda / MSG / HM / QN / There are some question in DB`);
            // maximum score to float
            let max_score = matched_questions[0]['score'];
            let ans = '';
            // if max score greater than 0
            if(max_score > 0) {
                console.log(`Noda / MSG / HM / QN / Choosing the best answer`);
                let score = 0;
                for(qus of matched_questions) {
                    if(!ans && qus['type'] === 0) {
                        ans = qus['answer'];
                        score = qus['score'];
                    }
                    if(score && qus['score']/score < 0.7) {
                        break;
                    } else if(qus['type'] === 1) {
                        ans = qus['answer'];
                        break;
                    }
                }
                // just in case
                if(!ans) ans = 'ой';

                // log top 3 matched questions
                console.log(`Noda / MSG / HM / QN / Top 3 matched questions`);
                matched_questions.forEach(function(elem, inx){
                    if(inx >= 3) return;
                    console.log(`\t${inx+1}. (${elem.score.toFixed(4)}) '${elem.question}' -- '${elem.answer}' -- ${elem.type}`);
                })
            } else {
                console.log(`Noda / MSG / HM / QN / No matches with questions in DB`);
                console.log(`Noda / MSG / HM / QN / Choose a random answer`);
                // no similar questions in DB
                ans = utils.rndAnswer(utils.confusedAnsw);
            }
            console.log(`Noda / MSG / HM / QN / Сhosen answer: '${ans}'`);
            // answer
            console.timeEnd('Noda / MSG / HM / QN / Answer time');
            message.channel.send(ans);
        }
    }
    // update coins, exp and lvl
    console.log(`Noda / MSG / HM / Add coins, exp and upd lvl`);
    user.coins += 1;
    user.exp += 1;
    if (user.exp >= user.lvl * 5) {
        user.exp = user.exp - user.lvl * 5;
        user.lvl += 1;
    }
}

module.exports.handle = handleQuestion;