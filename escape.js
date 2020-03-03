//E000
const start = 0xE000;
const symbols = ",\\,$,!,{,},<,>,[,]".split(',');
const esc = {}, text = {}, raw = {};
const reKey = new RegExp(`[\\u${start.toString(16).padStart(4,0)}-\\u${(start+symbols.length-1).toString(16).padStart(4,0)}]`, 'gu');
const reEscape = /\\([\]\\[<>{}$!])/gu;

symbols.forEach((value, i)=>{
	let key = String.fromCodePoint(start + i);
	esc[value] = key;
	text[key] = value;
	raw[key] = '\\'+value;
});

function escape(str){
	return str.replace(reEscape, (str, sym)=>(esc[sym]));
}

function toText(str){
	return str.replace(reKey, (key)=>(text[key]));
}

function getRaw(str){
	return str.replace(reKey, (key)=>(raw[key]));
}

module.exports = {
	escape,
	toText,
	getRaw
}