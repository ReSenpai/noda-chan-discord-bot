// regex
const prefix = `^!`;
const buy_question = new RegExp(prefix + 'купить вопрос$', 'i');
const buy_common_question = new RegExp(prefix + 'общий вопрос$', 'i');
const buy_personal_question = new RegExp(prefix + 'личный вопрос$', 'i');
const just_question = new RegExp(prefix + 'вопрос', 'i');
const show_profile = new RegExp(prefix + 'профиль$', 'i');
const cube = new RegExp(prefix + 'куб.*', 'i');
const money = new RegExp(prefix + 'монетки$', 'i');
const personal_question = /^личный$/i;
const common_question = /^общий$/i;
const noda = /^нода$/i;
const question = /^нода/i;


module.exports = {buy_question, buy_common_question, buy_personal_question, just_question, show_profile, personal_question, common_question, question, noda, cube, money};