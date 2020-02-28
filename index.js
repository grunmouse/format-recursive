
const {
	grouper,
	ignore,
	compiler
} = require('./syntaxer.js');

const {
	lexer,
	preeval
} = require('./lexer.js');


const fs = require('fs');

let tmp = fs.readFileSync('..\\db-book\\db-files\\vers-0\\template\\setlost.sql', {encoding:'UTF-8'});


let a = lexer(tmp);
a = preeval(a);
a = grouper(a);
a = ignore(a);

a = compiler(a);

for(let x of a){
	console.log(x);
}