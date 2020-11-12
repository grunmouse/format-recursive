const translator = require('../syntaxer.js');

const lexer = require('../lexer.js');
const factory = require('../factory.js');


console.log(...lexer('before ${sub!} after'));
console.log(translator(lexer('before ${sub!} after')));