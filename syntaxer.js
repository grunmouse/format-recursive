
const Stack = require('@grunmouse/stack');

const makeTranslator = require('./translator.js');

const State = require('./language-dev.js');

/**
 * Объединяет леворекурсивную пару нетерминалов, сливая их data в общий массив
 * Например ARGLIST(ARGLIST(ARG), ARG) => ARGLIST(ARG, ARG)
 */
const toConcat = (type, data)=>{
	if(data.length>1 && data[0].type === type){
		data = data[0].data.concat(data.slice(1));
	}
	return data;
};

/**
 * Специальные функции обработки сворачиваемых строк
 * @const Special : Object<String.Function<(type, data=>(data)>>
 * Функции ищутся по типу создаваемого нетерминала, этот же тип передаётся первым аргументом, а вторым - его data.
 * В результате data должна быть преобразована специфичным для нетерминала образом
 */
const Special = {
	MAIN:toConcat,
	ARGLIST:toConcat,
	ARGTEXT:toConcat
};



//console.log(graph.states, graph.reduce);
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

//console.log(State);

module.exports = makeTranslator(State, Special);