const Stack = require('@grunmouse/stack');


function makeTranslator(State){

	/**
	 * 
	 * @param tockens:Iterable - итератор токенов, полученный из лексического анализатора
	 * Строит абстрактное дерево трансляции
	 * @returned Object - возвращает корневой нетерминал, в данных которого иерархически вложено всё остальное
	 */
	return function translator(tockens){
		/**
		 * Стек пар символов [дно, 0,  символ, состояние,  символ, состояние, ... символ, состояние]
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
				throw new Error(`Unknown pair state=${state} tocken=${type}`);
			}
		}
	}


}

module.exports = makeTranslator;
