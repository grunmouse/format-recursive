const {
	parseRule,
	SituationsSet,
	CLOSURE,
	GOTO,
	buildGraph,
	makeStates,
	toDot
} = require('../make-syntax.js');

let s = parseRule("DOCALL := text 'end generic' *");

const all = new SituationsSet(
`
	MAIN := text;
	MAIN := MAIN CALL text;
	MAIN := MAIN INCORRECT;
	CALL := macro;
	CALL := generic ARGLIST text 'end generic';
	CALL := generic text 'end generic';
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

//console.log(all);

const graph = buildGraph('MAIN', all);

//console.log(toDot(graph.edges, graph.reduce));

if(graph.conflict.lenght > 0){
	console.log(graph.conflict);
	throw new Error('Grammatic conflict!');
}

const State = makeStates(graph.edges, graph.reduce);

//console.log(JSON.stringify(g,'','\t'));
console.log(JSON.stringify(State,'','\t'));