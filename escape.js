/**
 * Предназначено для замены экранированных комбинаций символов на 
 * символы из пользовательского диапазона,
 * и последующего их преобразования в исходные символы с экранированием или без
 */

//E000
const start = 0xE000;
const symbols = ",\\,$,!,{,},<,>,[,]".split(',');
const esc = {}, text = {}, raw = {};

const codeStart = start.toString(16).padStart(4,0);
const codeEnd = (start+symbols.length-1).toString(16).padStart(4,0);
const reKey = new RegExp(`[\\u${codeStart}-\\u${codeEnd}]`, 'gu');
const reEscape = /\\([\\\]\[<>{}$!]?)/gu;

symbols.forEach((value, i)=>{
	let key = String.fromCodePoint(start + i);
	esc[value] = key;
	text[key] = value;
	raw[key] = '\\'+value;
});

/**
 * Получить из исходной строки эскапированную строку
 */
function escape(str){
	return str.replace(reEscape, (str, sym)=>(esc[sym]));
}

/**
 * Получить из эскапированной строки разэкранированный текст
 */
function toText(str){
	return str.replace(reKey, (key)=>(text[key]));
}

/**
 * Получить из эскапированной строки исходную строку
 */
function getRaw(str){
	return str.replace(reKey, (key)=>(raw[key]));
}

module.exports = {
	escape,
	toText,
	getRaw
}