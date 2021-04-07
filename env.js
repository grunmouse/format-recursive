
const compil = require('./compil.js');

function ensureIterable(iterable){
	if(iterable && typeof iterable === 'object' && !iterable[Symbol.iterator]){
		iterable = Object.entries(iterable);
	}
	return iterable;
}

/**
 * @class Frame - кадр, хранящий значения
 * @extends Map <String.Function>
 * Может инициализироваться объектом
 * Содержит функции. 
 * При добавлении автоматически компилирует добавляемые строки. Если передана не функция и не строка - бросит ошибку
 */
class Frame extends Map{
	constructor(iterable){
		super(ensureIterable(iterable));
	}
	
	make(vars){
		let frame = new Frame(this);
		if(vars){
			frame.addMany(vars);
		}
		return frame;
	}
	
	empty(){
		return new Frame();
	}
	
	/**
	 * @param key
	 * @param value : (Function|String) - шаблон или функция, шаблон будет скомпилирован
	 */
	set(key, value){
		if(typeof value === 'string'){
			value = compil(value);
		}
		if(!value.call){
			throw new TypeError('Value is not callable');
		}
		super.set(key, value);
	}
	
	addMany(iterable){
		iterable = ensureIterable(iterable);
		for(let [key, value] of iterable){
			this.set(key, value);
		}
		return this;
	}

	/**
	 * Выполнить шаблон по имени, передав ему параметры
	 */
	run(name, params){
		let fun = this.get(tmpl);
		let fra = this.make(params);
		let str = fun(fra);
	}
}

module.exports = Frame;