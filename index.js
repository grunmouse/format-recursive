
const compil = require('./compil.js');

const Frame = require('./env.js');

const escape = require('./escape.js');


function use(tmpl, vars){
	const fra = new Frame();
	if(vars) for(let a in vars){
		fra.set(a, vars[a]);
	}
	const fun = compil(tmpl);
	
	return escape.toText(fun(fra));
}

function compile(tmpl){
	const fun = compil(tmpl);
	return (vars)=>{
		const fra = new Frame();
		if(vars) for(let a in vars){
			fra.set(a, vars[a]);
		}
		return escape.toText(fun(fra));
	}
}


module.exports = {
	escape,
	compile,
	use
};