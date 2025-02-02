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
const calculate = new RegExp(prefix + 'посчитай|считай|calc', 'i');
const help = new RegExp(prefix + 'help$|хелп$', 'i');
const blacklist_calc = /^[^a-z]*$/i;
const leaves = new RegExp(prefix + 'листья', 'i');
const daily = new RegExp(prefix + 'дейлик|daily', 'i');
const two_bots = new RegExp(prefix + 'диалог', 'i');

// blackjack

const deal = new RegExp('[0-9]', 'ig');
const surrender = new RegExp('surrender$|pass$|пасc$|пас$', 'i');
const hit = new RegExp('hit$|хит$|взять$|ещ?$|карту$', 'i');
const stand = new RegExp('stand$|хватит$|стоп$', 'i');
const double = new RegExp('double$|удвой$|удвоение$|удвоить$', 'i');
const insurance = new RegExp('insurance$|страховка$|страх$', 'i');
const bj_help = new RegExp('help$|хелп$', 'i');




module.exports = {buy_question, buy_common_question, buy_personal_question, just_question, show_profile, personal_question, common_question, question, noda, cube, money, help, deal, surrender, hit, stand, double, insurance, bj_help, calculate, blacklist_calc, leaves, daily, two_bots};