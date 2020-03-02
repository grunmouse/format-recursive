
const {
	translator
} = require('./syntaxer.js');

const lexer = require('./lexer.js');




const fs = require('fs');

let tmp = fs.readFileSync('..\\db-book\\db-files\\vers-0\\template\\setlost.sql', {encoding:'UTF-8'});


let a = lexer(tmp);



for(let x of a){
	console.log(JSON.stringify(x));
}

let m = translator(lexer(tmp));

console.log(JSON.stringify(m, '', 4));