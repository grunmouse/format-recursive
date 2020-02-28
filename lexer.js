const Stack = require('@grunmouse/stack');


const lexPattern = /(\\\\|\\.|\$+\{|\}|\[|\]|<|>|\!|[A-Za-z$_][A-Za-z$_\d]*|\s+)/g;

const lexType = (str)=>{
	if(str.length === 1 && !!~'[]<>}!'.indexOf(str)){
		return str;
	}
	if(str[0]=== '\\'){
		return 'escape';
	}
	else if(/^\$+\{$/.test(str)){
		return 'buck';
	}
	else if(/^\s+$/.test(str)){
		return 'space';
	}
	else if(/^[A-Za-z$_][A-Za-z$_\d]*$/.test(str)){
		return 'name';
	}
	else{
		return 'else';
	}
}
/*
Types
	[
	]
	<
	>
	buck
	}
	!
	escape
	space
	name
	else
*/
/*
	Символы, не меняющие состояние - считаются продолжением строки.
	Символы, меняющие состояние - считаются управляющими символами и передаются отдельно.
	Символы, возвращающие ignore - считаются безразличными и передаются отдельно.
	Символы, возворащающие error - вызывают ошибку.
	Символы, возвращающие pop - меняют состояние на предыдущее
	
	Символ any по умолчанию не меняет состояния.
	Символ прочие символы по умолчанию равны символу any.

 */
const lexTable = {
	text:{
		buck:'varname',
	},
	argtext:{
		buck:'varname',
		'>':'pop'
	},
	'varname':{
		'[':'ecranname',
		'}':'pop',
		'!':'argname',
		'name':'varname',
		'space':'ignore',
		'any':'error'
	},
	ecranname:{
		']':'pop'
	},
	argname:{
		'}':'pop pop',
		'<':'argtext',
		'[':'ecranname',
		'space':'ignore',
		'name':'argname',
		'else':'ignore',
		'any':'error'
	}
};

/*
 OutTypes
	<
	>
	call
	macro
	}
	!
	text
	name
	ignore
*/

const lexFunction = (state, type)=>(lexTable[state][type] || lexTable[state]['any'] || state);

/**
 * Распознаёт лексемы, создаёт для них токены
 */
function *lexer(str){
	let elements = str.split(lexPattern).filter(a=>a.length>0);
	//console.log(elements);
	let stack = new Stack();
	stack.push('text');
	let buffer = [];
	for(let item of elements){
		let state = stack.top;
		let type = lexType(item);
		let next = lexFunction(state, type);
		
		if(type === 'escape'){
			item = item.slice(1);
		}
		
		if(next === state){
			buffer.push(item);
		}
		else{
			//Значение - не часть текущего состояния, нужно отправить буфер
			yield {type:state, buffer};
			buffer = [];
			//Буфер сброшен
			if(next === 'ignore'){
				yield {type:'ignore', buffer:[item]};
			}
			else if(next === 'error'){
				throw new SyntaxError(`Неожиданный ${item} в ${state}`);
			}
			else{
				//console.log(stack.top + '(' + item + ')');
				//next - меняет состояние
				if(next === 'pop'){
					stack.pop();
				}
				else if(next === 'pop pop'){
					stack.pop();
					stack.pop();
				}
				else{
					stack.push(next);
				}
				
				yield {type, buffer:[item]};
			}
		}
	}
	yield {type:stack.top, buffer};
}

/**
 * Вычисляет значения токенов и обобщает их
 */
 
function *preeval(iterable){
	for(let item of iterable){
		switch(item.type){
			case 'argname':
			case 'varname':
			case 'ecranname':
				item.type = 'name';
				item.value = item.buffer.join('');
				if(!item.value) continue;
				break;
			case 'text':
			case 'argtext':
				item.type = 'text';
				item.value = item.buffer.join('');
				break;
			case '[':
			case ']':
				item.value = item.buffer[0];
				item.type = 'ignore';
				break;
			case 'buck':
				item.value = item.buffer[0];
				item.type = item.value > 2 ? 'macro' : 'call';
				break;
			default:
				item.value = item.buffer.join('');
				break;
		}
		yield item;
	}
}

/*
 OutTypes
	<
	>
	call
	macro
	}
	!
	text
	name
	ignore
*/


module.exports = {
	lexer,
	preeval
};
