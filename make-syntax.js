const inspect = Symbol.for('nodejs.util.inspect.custom');
//const util = require('util');

//[util.inspect.custom]

//console.log(inspect === util.inspect.custom);

class Situation{
	constructor(left, right, pos=0){
		this.left = left;
		this.right = right;
		this.pos = pos;
	}
	
	get isFinal(){
		return this.pos>=this.right.length;
	}
	
	get next(){
		return this.right[this.pos];
	}
	
	toString(){
		const {left, right, pos} = this;
		const prev = right.slice(0, pos).join(" "), next = right.slice(pos).join(" ");
		
		return `${left} := ${prev} * ${next}`;
	}
	
	toJSON(){
		return ''+this;
	}
	
	[inspect](depth, options){
		return ''+this.toString();
	}
	
	move(symbol){
		if(symbol && this.next !== symbol){
			throw new Error(`Incorrect symbol "${symbol}" for "${this}"`);
		}
		if(this.isFinal){
			throw new Error(`Situation is final: "${this}"`);
		}
		
		return new Situation(this.left, this.right, this.pos+1);
	}
	
	restart(){
		return new Situation(this.left, this.right, 0);
	}
}

function convertPair(item){
	let key;
	if(typeof item === 'string'){
		key = item;
		item = parseRule(item);
	}
	else if(item instanceof Situation){
		key = '' + item;
	}
	else if(Array.isArray(item)){
		if(item[1] instanceof Situation){
			return convertPair(item[1]);
		}
		else{
			throw new TypeError('Incorrect type '+item);
		}
	}
	return [key, item];
}

class SituationsSet extends Map{
	
	
	constructor(itr){
		itr = itr ? [...itr] : [];
		itr = itr.map((s)=>(convertPair(s)));
		super(itr);
	}
	add(item){
		const key = ''+item;
		if(super.has(key)){
			return super.get(key);
		}
		this.set(key, item);
		return item;
	}
	get(item){
		return super.get('' + item);
	}
	has(item){
		return super.get('' + item);
	}
	[Symbol.iterator](){
		return super.values();
	}
	toString(){
		return [...this].join(';\n');
	}
	toJSON(){
		return [...this];
	}
	[inspect](depth, options){
		return this.toJSON();
	}
	
	get key(){
		return [...this].sort().join(';\n');
	}
	
	next(){
		let arr = [...this].map(s=>(s.next)).filter((a)=>(!!a));
		
		return new Set(arr);
	}
	
	hasConflict(){
		const reduce = [...this].filter(s=>s.isFinal);
		const go = [...this].filter(s=>(!s.isFinal));
		
		return reduce.length>1 || reduce.length === 1 && go.length >1;
	}
	
	*itrForLeft(name){
		for(let item of this){
			if(item.left === name){
				yield item;
			}
		}
	}

	*itrForNext(name){
		for(let item of this){
			if(item.next === name){
				yield item;
			}
		}
	}
}

class SetWithKey extends Map{
	add(item){
		const key = item.key;
		if(super.has(key)){
			return super.get(key);
		}
		this.set(key, item);
		return item;
	}
	get(item){
		if(typeof item !== 'string'){
			item = item.key;
		}
		return super.get(item);
	}
	has(item){
		if(typeof item !== 'string'){
			item = item.key;
		}
		return super.get(item);
	}
	[Symbol.iterator](){
		return super.values();
	}
	toString(){
		return [...this].join(';\n');
	}
	
	get key(){
		return [...this].sort().join(';\n');
	}
	
	toJSON(){
		return [...this];
	}
}

function parseRule(code){
	let [left, right] = code.split(':=');
	left = left.trim();
	right = right.trim();
	let items = right.split(/\s+|('[^']+')/g).filter((a)=>(!!a));
	
	let pos = items.indexOf('*');
	
	if(pos>-1){
		items.splice(pos, 1);
	}
	else{
		pos = 0;
	}
	
	return new Situation(left, items, pos);
}



function CLOSURE(I, all){
	
	const arr = [...I];
	const net = new Set();
	for(let i=0; i<arr.length; ++i){
		let item = arr[i];
		if(!item.isFinal){
			let next = item.next;
			if(!net.has(next)){
				arr.push(...all.itrForLeft(next));
				net.add(next);
			}
		}
	}
	
	return new SituationsSet(arr);
}

function GOTO(I, X, all){
	let arr = [];
	for(let item of I.itrForNext(X)){
		arr.push(item.move(X));
	}
	return CLOSURE(arr, all);
}

class State{
	constructor(I){
		this.I = I;
		this.edges = new Map();
	}
	
	get key(){
		return this.I.key;
	}
	
}

function *itrNotBlack(states){
	let itr = states.values();
	while(true){
		let s = itr.next();
		if(s.done){
			return;
		}
		
		let q = s.value;
		if(!q.black){
			yield q;
			
			itr = states.values();
		}
	}
}

function buildGraph(start, all){
	const nodes = new SetWithKey();
	
	let q0 = new State(CLOSURE(new SituationsSet(all.itrForLeft('MAIN')), all));
	
	nodes.add(q0);
	
	for(const q of itrNotBlack(nodes)){
		const I = q.I;
		const next = I.next();
		for(const X of next){
			let J = GOTO(I, X, all);
			let q1 = new State(J);
			q1 = nodes.add(q1);
			q.edges.set(X,q1);
		}
		q.black = true;
	}
	
	[...nodes].forEach((q, i)=>{
		q.number = i;
	});
	
	const statedoc = {};
	const states = new Set();
	const reduce = new Map();
	const conflict = [];
	
	const edges = [];
	
	for(let q of nodes){
		statedoc[q.number] = q.I;
		if(q.I.hasConflict()){
			conflict.push(q.I);
		}
		if(q.edges.size > 0){
			states.add(q.number);
			for(let [X,q1] of q.edges){
				edges.push([q.number, X, q1.number]);
			}
		}
		else if(q.I.size === 1){
			let rule = q.I.values().next().value;
			
			rule = rule.restart();
			
			reduce.set(q.number, [rule.left, rule.right.length]);
		}
	}
	
	edges.forEach((edge)=>{
		let number = edge[2];
		let type = states.has(number) ? 'Q' : reduce.has(number) ? 'R' : 'ERR';
		if(type === 'ERR'){
			throw new Error('Invalid automat command number ' + number);
		}
		let rule = [type, number];
		edge[2] = rule;
	});
	
	return {statedoc, edges, reduce, conflict};
}

/**
 * Создаёт таблицу переключения состояний транслятора
 */
function makeStates(edges, reduce){
	const result = {};
	for(let [q, x, rule] of edges){
		result[q] = result[q] || {};
		if(x[0] === "'"){
			x = x.slice(1,-1);
		}
		if(rule[0] === 'Q'){
			result[q][x] = rule;
		}
		else if(rule[0] === 'R'){
			result[q][x] = ['R', reduce.get(rule[1])];
		}
	}
	return result;
}

function toDot(edges, reduce){
	const result = [];
	for(let [r, rule] of reduce){
		let node = `R${r}[label="${rule[0]}";shape="rectangle"];`;
		result.push(node);
	}
	for(let [q, x, rule] of edges){
		let edge = `Q${q} -> ${rule.join('')} [label="${x}"];`;
		result.push(edge);
	}
	
	return result.join('\n');
}

module.exports = {
	parseRule,
	SituationsSet,
	CLOSURE,
	GOTO,
	buildGraph,
	makeStates,
	toDot
};
