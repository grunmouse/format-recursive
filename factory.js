/**
 *
 * @interface ITemplate - представляет целый шаблон или элемент шаблона
 * @constructor (obj : {type, data}) - конструктор принимает символ языка, возвращённый syntaxer
 * @method toText(env) => String - вычисляет результат подстановки, используя значения из окружения env
 * @method getRaw() => String - возвращает исходный код
 */


/**
 * Представляет текст без подстановок
 * @implements ITemplate
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
 * @implements ITemplate
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
 * @implements ITemplate
 */
class Call{
	constructor(obj){
		let items = obj.data;
		let header = items[0];
		if(header.type === 'generic'){
			let [generic, arglist, text, endgen] = items;
			if(!endgen){
				endgen = text;
				text = arglist;
				arglist = undefined;
			}
			this.arglist = new Arglist(arglist);
			this.tail = text.raw + endgen.raw;
		}
		this.name = header.name;
		this.level = header.level;
		this.header = header.raw;
		
	}
	toText(env){
		if(this.level !== ""){
			//Если макрос заэкранирован дополнительными $, не раскрываем его, но уменьшаем уровень экранирования
			if(this.arglist){
				return this.level + '{' + this.name + '!'+ this.arglist.toText(env) + this.tail;
			}
			else{
				return this.level + '{' + this.name + '}';
			}
		}
		else if(env.has(this.name)){
			let fun = env.get(this.name);
			let frame = this.arglist ? this.arglist.getFrame(env) : env.empty();
			
			return fun(frame);
		}
		else{
			//Если в окружении нет имени макроса - не раскрываем его
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
		this.items = obj ? obj.data.map(a=>(new Arg(a))) : [];
	}
	/**
	 * Вычисляет аргументы и создаёт новое окружение для вызываемого макроса
	 */
	getFrame(env){
		let frame = env.make();
		this.items.forEach(arg=>{
			frame.set(arg.name, arg.getValue(env));
		});
		return frame;
	}
	/**
	 * Вычисляет аргументы и составляет из новый код списка аргументов
	 */
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
		/**
		 * @var text - текст, предшествующий имени аргумента (пробелы, знаки препинания, пр.)
		 * @var arg - 
		 */
		let [text, arg, ARGTEXT, endarg] = obj.data;
		this.header = text.raw + arg.raw;
		this.name = arg.name;
		this.template = new Template(ARGTEXT);
		this.tail = endarg.raw;
	}
	
	/**
	 * @property name :String - имя аргумента
	 */
	 
	 
	/**
	 * Вычисляет значение аргумента
	 */
	getValue(env){
		return this.template.toText(env);
	}
	/**
	 * Выполняет подстановки внутри аргумента и возвращает новый код аргумента
	 */
	toText(env){
		return this.header + this.template.toText(env) + this.tail;
	}
	getRaw(){
		return this.header + this.template.getRaw() + this.tail;
	}
}

/**
 * @const mapping : Object<String.Constructor(ITemplate)>
 */
const mapping = {
	MAIN:Template,
	CALL:Call,
	ARGTEXT:Template,
	text:Primitive
};

/**
 * Создаёт обёртки над нетерминалами и текстом
 * @param obj - AST шаблона
 * @return {ITemplate}
 */
function factory(obj){
	let Ctor = mapping[obj.type];
	return new Ctor(obj);
}

module.exports = factory;