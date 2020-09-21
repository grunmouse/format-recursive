
const compil = require('./compil.js');

const Frame = require('./env.js');

const escape = require('./escape.js');


function use(tmpl, vars, env){
	const fun = compil(tmpl);
	const fra = new Frame(vars, env);
	
	return escape.toText(fun(fra));
}

function compile(tmpl){
	const fun = compil(tmpl);
	return (vars)=>{
		const fra = new Frame(vars);
		return escape.toText(fun(fra));
	}
}


module.exports = {
	escape,
	compile,
	use,
	Frame
};