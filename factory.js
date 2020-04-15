
/**
 * Представляет текст без подстановок
 */
class Primitive{
	constructor(obj){
		if(typeof obj === 'string'){
			this.raw = obj;
		}
		else if(typeof obj.raw === 'string'){
			this.raw = obj.raw;
		}
	}
	toText(){
		return this.raw;
	}
	getRaw(){
		return this.raw;
	}
}

/**
 * Представляет любой валидный шаблон.
 * Состоит из чередующихся Primitive и Call
 */
class Template{
	constructor(obj){
		this.items = obj.data.filter(a=>!(a.type==='text' && a.raw.length===0)).map(factory);
	}
	toText(env){
		return this.items.map(a=>a.toText(env)).join('');
	}
	getRaw(){
		return this.items.map(a=>a.getRaw()).join('');
	}
}

/**
 * Представляет подстановку
 */
class Call{
	constructor(obj){
		let items = obj.data;
		let header = items[0];
		if(header.type === 'generic'){
			let [generic, arglist, text, endgen] = items;
			this.arglist = new Arglist(arglist);
			this.tail = text.raw + endgen.raw;
		}
		this.name = header.name;
		this.level = header.level;
		this.header = header.raw;
		
	}
	toText(env){
		if(this.level !== ""){
			if(this.arglist){
				return this.level + '{' + this.name + '!'+ this.arglist.toText(env) + this.tail;
			}
			else{
				return this.level + '{' + this.name + '}';
			}
		}
		else if(env.has(this.name)){
			let fun = env.get(this.name);
			let frame = this.arglist ? this.arglist.getFrame(env) : env;
			
			return fun(frame);
		}
		else{
			if(this.arglist){
				return '${' + this.name + '!'+ this.arglist.toText(env) + this.tail;
			}
			else{
				return '${' + this.name + '}';
			}
		}
	}
	getRaw(){
		return this.header + (this.arglist ? this.arglist.getRaw() + this.tail : '');
	}
}

/**
 * Представляет массив аргументов
 */
class Arglist{
	constructor(obj){
		this.items = obj.data.map(a=>(new Arg(a)));
	}
	getFrame(env){
		let frame = env.make();
		this.items.forEach(arg=>{
			frame.set(arg.name, arg.getValue(env));
		});
		return frame;
	}
	toText(env){
		return this.items.map(a=>a.toText(env)).join('');
	}
	getRaw(){
		return this.items.map(a=>a.getRaw()).join('');
	}
}

/**
 * Представляет аргумент
 * Содержит информацию об имени аргумента и его значения типа Template
 */
class Arg{
	constructor(obj){
		let [text, arg, ARGTEXT, endarg] = obj.data;
		this.header = text.raw + arg.raw;
		this.name = arg.name;
		this.template = new Template(ARGTEXT);
		this.tail = endarg.raw;
	}
	getValue(env){
		return this.template.toText(env);
	}
	toText(env){
		return this.header + this.template.toText(env) + this.tail;
	}
	getRaw(){
		return this.header + this.template.getRaw() + this.tail;
	}
}

const mapping = {
	MAIN:Template,
	CALL:Call,
	ARGTEXT:Template,
	text:Primitive
};

function factory(obj){
	let Ctor = mapping[obj.type];
	return new Ctor(obj);
}

module.exports = factory;