var request = require('request');
const fs = require('fs');

var URL = 'https://fwcalc.com/dissidia/ru/files/js/ha/data.js';

const data = require('./data.js')

// data.forEach(element => {
//     console.log(element)
// });
console.log(data.data.length);

// request(URL, function (err, res, body) {
//     if (err) throw err;
//     // console.log(body);

//     let spliti = body.split('var data=')
//     let hz = spliti[1].split(',')
//     const result = hz.filter(word => word.length == /name:.*/i.test(word));
//     console.log(result);
//     // fs.writeFile('./parse.json', JSON.stringify(spliti), (err) => {
//     //     if(err){
//     //         console.log(err)
//     //     }
//     // })

//     // let parse = require('./parse.json')

//     // let result = JSON.parse(parse);

//     // console.log(result);
// });




