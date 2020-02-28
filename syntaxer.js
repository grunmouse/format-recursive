
const Stack = require('@grunmouse/stack');

function *grouper(tockens){
	let state = 'start', type;
	let buffer;
	for(let item of tockens){
		if(state === 'start'){
			type = item.type;
			buffer = [item.value];
			state = type;
		}
		else if(type === item.type){
			if(['name', 'text', 'ignore'].includes(type)){
				buffer.push(item.value);
			}
			else{
				let value = buffer.join('');
				yield {type, value};
				buffer = [item.value];
			}
		}
		else{ 
			let value = buffer.join('');
			yield {type, value};
			if(state === 'noname' && item.type === 'name'){
				throw new SyntaxError(`Неожиданное имя ${value} ${item.value}`);
			}
			else if(state === 'name' && item.type === 'ignore'){
				state = 'noname';
			}
			else{
				state = item.type;
			}
			type = item.type;
			buffer = [item.value];
		}
	}
	let value = buffer.join('');
	yield {type, value};
}

function *ignore(tockens){
	for(let item of tockens){
		if(item.type !== 'ignore'){
			yield item;
		}
	}
}

/*

S -> text S;
S -> macro name DOCALL S;
S -> call name DOCALL S;
S -> none;
DOCALL -> };
DOCALL -> ! ARGLIST;
ARGLIST -> name < ARG ARGLIST;
ARGLIST -> };
ARG -> text ARG;
ARG -> macro name DOCALL ARG;
ARG -> call name DOCALL ARG;
ARG -> >;

*/



function *compiler(tockens, doEval){
	let stack = new Stack();
	let oper = new Stack();
	stack.push({type:'S'});
	oper.push(0);
	for(let item of tockens){
		//console.log('top ' , stack.top.type);
		//console.log('item ' , item.type);
		//console.log('item ' , item.type);
		let top = stack.pop();
		
		let command = oper.pop();

		let net = false;
		if(top.type === 'S'){
			if(item.type === 'text'){
				stack.pushMany([{type:'S'}, item]);
				oper.pushMany(['push', item]);
			}
			else if(item.type === 'call'){
				stack.pushMany([{type:'S'}, {type:'DOCALL'}, {type:'name'}, item]);
				oper.pushMany(['push', 0, 1, 1]);
			}
			else if(item.type === 'macro'){
				stack.pushMany([{type:'S'}, {type:'DOCALL'}, {type:'name'}, item]);
				oper.pushMany(['push', 0, 1, 1]);
			}
			else{
				throw new SyntaxError(`S -> ${item.type}`);
			}
			net = true;
		}
		else if(top.type === 'ARG'){
			if(item.type === 'text'){
				stack.pushMany([{type:'ARG'}, item]);
				oper.pushMany([0, item]);
			}
			else if(item.type === 'call'){
				stack.pushMany([{type:'ARG'}, {type:'DOCALL'}, {type:'name'}, item]);
				oper.pushMany(['concat', 0, 1, 1]);
			}
			else if(item.type === 'macro'){
				stack.pushMany([{type:'ARG'}, {type:'DOCALL'}, {type:'name'}, item]);
				oper.pushMany(['concat', 0, 1, 1]);
			}
			else if(item.type === '>'){
				stack.push(item);
				oper.push('def');
			}
			else{
				throw new SyntaxError(`S -> ${item.type}`);
			}
			net = true;
		}
		else if(top.type === 'DOCALL'){
			if(item.type === '}'){
				stack.push(item);
				oper.push('eval');
			}
			else if(item.type === '!'){
				stack.pushMany([{type:'ARGLIST'}, item]);
				oper.pushMany([0, 'begin']);
			}
			else{
				throw new SyntaxError(`DOCALL -> ${item.type}`);
			}
			net = true;
		}
		else if(top.type === 'ARGLIST'){
			if(item.type === '}'){
				stack.push(item);
				//oper.pop();
				oper.push('eval');
			}
			else if(item.type === 'name'){
				stack.pushMany([{type:'ARGLIST'}, {type:'ARG'}, {type:'<'}, item]);
				//oper.pop(0);
				oper.pushMany([0, 0, 0, 1]);
			}
			else{
				throw new SyntaxError(`ARGLIST -> ${item.type}`);
			}
			net = true;
		}
		
		if(net){
			top = stack.pop();
			
			if(command == 0){
			}
			else if(command == 1){
				yield item;
			}
			else if(command.call){
				yield command(item);
			}
			else{
				yield command;
			}
			command = oper.pop();
		}
		
		if(top.type === item.type){
			if(command == 0){
			}
			else if(command == 1){
				yield item;
			}
			else if(command.call){
				yield command(item);
			}
			else{
				yield command;
			}
		}
		else{
			throw new SyntaxError(`${top.type} -> ${item.type}`);
		}
		
	}
	
	yield 'push';
}


module.exports = {
	grouper,
	ignore,
	compiler,
};