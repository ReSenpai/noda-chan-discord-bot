const profileConstructor = () => {
    const uid = message.author.id;
    const nickname = message.member.nickname;
    const username = message.author.username;

    bot.send = function(msg) {
        message.channel.send(msg)
    }

    if(!userLvl[uid]) {
        userLvl[uid] = {
            nickname: nickname,
            username: username,
            coins: 10,
            warns: 0,
            xp: 0,
            lvl: 0,
            questions: {
                question: [],
                answer: []
            }
        }
    }

    const u = userLvl[uid];
    u.coins++;
    u.xp++;
    if(u.xp >= (u.lvl * 5)) {
        u.xp = 0;
        u.lvl += 1;
    }

    fs.writeFile('./user_lvl.json', JSON.stringify(userLvl), (err) => {
        if(err){
            console.log(err)
        }
    })
}

module.exports = profileConstructor;