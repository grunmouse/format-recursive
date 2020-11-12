const {
	SituationsSet,
	buildGraph,
	makeStates
} = require('./make-syntax.js');

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

if(graph.conflict.lenght > 0){
	console.log(graph.conflict);
	throw new Error('Grammatic conflict!');
}

State = makeStates(graph.states, graph.reduce);

module.exports = State;