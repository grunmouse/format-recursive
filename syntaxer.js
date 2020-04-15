
const Stack = require('@grunmouse/stack');

/*
1	MAIN := text;
2	MAIN := MAIN CALL text;
3	MAIN := MAIN INCORRECT;
4	CALL := macro;
5	CALL := generic ARGLIST text end generic;
6	ARGLIST := ARG;
7	ARGLIST := ARGLIST ARG;
8	ARG := text arg ARGTEXT end arg;
9	ARGTEXT := text;
10	ARGTEXT := ARGTEXT CALL text;
	
11	INCORRECT := generic IARGLIST;
12	IARGLIST := IARG;
13	IARGLIST := ARGLIST IARG;
14	IARG := text arg IARGTEXT;
15	IARG := error;
16	IARGTEXT := ARGTEXT CALL error;
17	IARGTEXT := error;
18	IARGTEXT := ARGTEXT INCORRECT;
*/

const Rule = {
	1:['MAIN', 1],
	2:['MAIN', 3],
	3:['MAIN', 2],
	4:['CALL', 1],
	5:['CALL', 4],
	6:['ARGLIST', 1],
	7:['ARGLIST', 2],
	8:['ARG', 4],
	9:['ARGTEXT', 1],
	10:['ARGTEXT', 3],
	
	11:['INCORRECT', 2],
	12:['IARGLIST', 1],
	13:['IARGLIST', 2],
	14:['IARG', 3],
	15:['IARG', 1],
	16:['IARGTEXT', 3],
	17:['IARGTEXT', 1],
	18:['IARGTEXT', 1]
};

const toConcat = (type, data)=>{
	if(data.length>1 && data[0].type === type){
		data = data[0].data.concat(data.slice(1));
	}
	return data;
};

const Special = {
	MAIN:toConcat,
	ARGLIST:toConcat,
	ARGTEXT:toConcat
};

/*
 * Таблица перехода
 * R - свёртка, номер - номер правила из Rule
 * Q - переход
 * @const State : Object<Number.(Object<String.Function<(stack,read,tocken)=>(next)>>)> - набор функций, выполняющих преобразования
 * функция выбирается из объекта по номеру состояния и типу очередного токена State[state][type],
 * вызывается с текущим стеком, функцией чтения входного потока и тем самым токеном tocken = handler(stack, read, tocken)
 * возвращаемое значение - это следующий токен
 * побочные эффекты - правильная работа со стеком
 */
const State = `
Q0,text = R1;
Q0,MAIN = Q1;

Q1,CALL = Q2
Q1,INCORRECT = R3
Q1,macro = R4
Q1,generic = Q3

Q2,text = R2

Q3,ARGLIST = Q4
Q3,IARGLIST = R11
Q3,ARG = R6
Q3,IARG = R12
Q3,text = Q5
Q3,error = R15

Q4,ARG = R7
Q4,IARG = R13
Q4,text = Q5
Q4,error = R15

Q5,arg = Q6
Q5,end generic = R5

Q6,ARGTEXT = Q7
Q6,IARGTEXT = R14
Q6,text = R9
Q6,error = R17

Q7,end arg = R8
Q7,CALL = Q8
Q7,INCORRECT = R18
Q7,macro = R4
Q7,genetic = Q3

Q8,text = R10
Q8,error = R16
`.split(/\n\s*/g).reduce((akk, text)=>{
	text.replace(/Q(\d+),([^=]+) = ([QR])(\d+)/, (_, state, type, command, number)=>{
		state = +state;
		number = +number;
		if(!akk[state]){
			akk[state] = {};
		}
		if(command === 'Q'){
			akk[state][type] = (stack, read, tocken)=>{
				stack.push(tocken);
				stack.push(number);
				return read();
			};
		}
		else if(command === 'R'){
			akk[state][type] = (stack, read, tocken)=>{
				let [ntype, count] = Rule[number];
				let data = [];
				for(let i=1; i<count; ++i){
					stack.pop();
					data.push(stack.pop());
				}
				data.reverse();
				data.push(tocken);
				let fun = Special[ntype];
				if(fun){
					data = fun(ntype, data);
				}
				return {type:ntype, data};
			};
		}
	});
	return akk;
}, {});

/**
 * 
 * @param tockens:Iterable - итератор токенов, полученный из лексического анализатора
 * Строит абстрактное дерево трансляции
 */
function translator(tockens){
	/**
	 * Стек пар символов [дно, 0, символ, состояние, символ, состояние, ... символ, состояние]
	 */
	const stack = new Stack();
	
	/**
	 * Читает очередной токен или генерирует токен <EOF>
	 */
	const read = ()=>{
		let item = tockens.next();
		return item.done ? {type:'<EOF>'} : item.value;
	};
	
	/**
	 * выталкивает несколько символов из стека и возвращает их в порядке добавления
	 */
	const pop = (count)=>{
		let result = [];
		for(let i=0; i<count; ++i){
			stack.pop();
			result.push(stack.pop());
		}
		return result.reverse();
	};
	
	let tocken = read();
	
	stack.push(0);
	while(true){
		let state = stack.top;
		let type = tocken.type;
		
		
		let handler = State[state][type];
		if(handler){
			tocken = handler(stack, read, tocken);
		}
		else if(type === '<EOF>'){
			let [MAIN] = pop(1);
			return MAIN;
		}
		else{
			throw new Error('HZ');
		}
	}
}

/*
	Нетерминальные символы
	MAIN
	CALL
	ARGLIST
	ARG
	ARGTEXT
	
	INCORRECT
	IARGLIST
	IARG
	IARGTEXT
*/

module.exports = translator;