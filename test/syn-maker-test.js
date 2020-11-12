const {
	parseRule,
	SituationsSet,
	CLOSURE,
	GOTO,
	buildGraph
} = require('../make-syntax.js');

let s = parseRule("DOCALL := text 'end generic' *");

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


const g = buildGraph('MAIN', all);
console.log(g.rules[0].left);
console.log(JSON.stringify(g,'','\t'));