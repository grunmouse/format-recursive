const Stack = require('@grunmouse/stack');

const call = (template, vars)=>{
	return [...evaluator(templace, vars)].join('');
};

const macro = (name, vars, level)=>{
	let head = '$'.repeat(level-1) + '{';
	
	let args = Object.keys(vars).map((name)=>{
		let text = vars[name];
		if(!/^[A-Za-z_$][A-Za-z\d+_$]*$/.test(name)){
			name = '['+name.replace(']', '\\]') + ']';
		}
		return name + '<' + text + '>';
	}).join('');
	
	if(args){
		return head + name + '!' + args + '}';
	}
	else{
		return head + name + '}';
	}
};


function *evaluator(commands, variables){
	const stack = new Stack();
	const frames = new Stack();
	
	const methods = {call, macro};
	
	for(let com of commands){
		if(com.type){
			if(com.type==='call' || com.type==='macro'){
				frames.push({});
			}
			stack.push(com);
		}
		else{
			switch(com){
				case 'push':{
					let command = stack.pop();
					yield command.value;
				} break;
				case 'concat':{
					let command = stack.pop();
					stack.top.value += command.value;
				} break;
				case 'begin':
					break;
				case 'def':{
					let value = stack.pop().value;
					let name = stack.pop().value;
					frames.top[name] = value;
				} break;
				case 'eval':{
					let vars = frames.pop();
					let name = stack.pop().value;
					let method = stack.pop();
					if(method.type === 'macro'){
						let level = method.value.length-1;
						let value = macro(name, vars, level);
						stack.push({type:'text', value});
					}
					else{
						if(name in variables){
							let value = call(variables[name], {...variables, ...vars});
						}
						else{
							let value = macro(name, vars, 2);
							stack.push({type:'text', value});
						}
					}
					
				} break;
			}
		}
	}
};

module.exports = {
	evaluator,
	eval:call
};