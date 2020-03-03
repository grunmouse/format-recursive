
const translator = require('./syntaxer.js');

const lexer = require('./lexer.js');

const factory = require('./factory.js');

const compil = require('./compil.js');

const Frame = require('./env.js');

const fs = require('fs');

let tmp = fs.readFileSync('..\\db-book\\db-files\\vers-0\\template\\setlost.sql', {encoding:'UTF-8'});
let fromNone = fs.readFileSync('..\\db-book\\db-files\\vers-0\\template\\from\\from-none.sql', {encoding:'UTF-8'});


let fra = new Frame();

fra.set('fromNone', fromNone);
fra.set('storageid', '123456789');

//let a = lexer(fromNone);

//[...a].forEach(a=>console.log(a));

//console.log(fra.get('fromNone')(fra));

let t = compil(tmp);

console.log(t(fra));