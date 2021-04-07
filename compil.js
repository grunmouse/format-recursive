
const translator = require('./syntaxer.js');

const lexer = require('./lexer.js');
const factory = require('./factory.js');

const escape = require('./escape.js');

/**
 * Создаёт из исходного кода функцию, дклающую подстановку и возвращающую текст
 * @param code
 * @return Function<(Environment)=>(String)>
 */
function compil(code){
	code = escape.escape(code);
	let ast = translator(lexer(code));
	let obj = factory(ast);
	return (env)=>(obj.toText(env));
}


module.exports = compil;