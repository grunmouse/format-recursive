
const compil = require('./compil.js');

class Frame extends Map{
	constructor(iterable){
		if(iterable && typeof iterable === 'object' && !iterable[Symbol.iterator]){
			iterable = Object.entries(iterable);
		}
		super(iterable);
	}
	make(){
		let frame = new Frame(this);
		return frame;
	}
	set(key, value){
		if(typeof value === 'string'){
			value = compil(value);
		}
		if(!value.call){
			throw new TypeError('Value is not callable');
		}
		super.set(key, value);
	}
}


module.exports = Frame;