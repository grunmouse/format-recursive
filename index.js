
const compil = require('./compil.js');

const Frame = require('./env.js');

const escape = require('./escape.js');


function use(tmpl, vars, env){
	const fun = compil(tmpl);
	let fra = env ? env.make(vars) : new Frame(vars);
	
	return escape.toText(fun(fra));
}

function compile(tmpl, env){
	const fun = compil(tmpl);
	env = env || new Frame();
	return (vars)=>{
		const fra = env.make(vars);
		return escape.toText(fun(fra));
	}
}


module.exports = {
	escape,
	compile,
	use,
	Frame
};