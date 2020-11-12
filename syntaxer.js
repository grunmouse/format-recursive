
const Stack = require('@grunmouse/stack');

const makeTranslator = require('./make-translator.js');

const {
	SituationsSet,
	buildGraph
} = require('./make-syntax.js');

const {
	makeStates
} = require('./make-states.js');

const all = new SituationsSet(
`
	MAIN := text;
	MAIN := MAIN CALL text;
	MAIN := MAIN INCORRECT;
	CALL := macro;
	CALL := generic ARGLIST text 'end generic';
	ARGLIST := ARG;
	ARGLIST := ARGLIST ARG;
	ARG := text arg ARGTEXT 'end arg';
	ARGTEXT := text;
	ARGTEXT := ARGTEXT CALL text;



	INCORRECT := generic IARGLIST;
	IARGLIST := IARG;
	IARGLIST := ARGLIST IARG;
	IARG := text arg IARGTEXT;
	IARG := error;
	IARGTEXT := ARGTEXT CALL error;
	IARGTEXT := error;
	IARGTEXT := ARGTEXT INCORRECT;
`.split(';').filter((a)=>(!!a.trim()))
);

const graph = buildGraph('MAIN', all);


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


State = makeStates(graph.states, graph.reduce, Special);

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

module.exports = makeTranslator(State);