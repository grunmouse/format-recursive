/**
 * Предназначено для замены экранированных комбинаций символов на 
 * символы из пользовательского диапазона,
 * и последующего их преобразования в исходные символы с экранированием или без
 */

/** 
 * @const start : {Int} - начало служебного диапазона символов для заменты
 * @const symbols : {Array<String>} - служебные символы, которые могут быть заэкранированы (пустая строка - тоже символ).
 */
//E000
const start = 0xE000;
const symbols = ",\\,$,!,{,},<,>,[,]".split(',');

/**
 * escape-коды первого и последнего символов служебного диапазона
 */
const diap = [start, start+symbols.length-1].map((number)=>('\\u' + number.toString(16).padStart(4,0)))

/**
 * @const reEscape : {RegExp} - регулярное выражение, соответствующее escape-последовательносям, запоминающее заэкранированный символ
 * @const reKey : {RegExp} - регулярное выражение, соответствующее символам служебного диапазона
 */
const reEscape = /\\([\\\]\[<>{}$!]?)/gu;
const reKey = new RegExp(`[${diap[0]}-${diap[1]}]`, 'gu');

/**
 * @const esc : {Object<String.String>} - карта отображения экранируемых символов на служебные символы
 * @const text : {Object<String.String>} - карта отображения служебных символов на разэкранированные символы
 * @const raw : {Object<String.String>} - карта отображения служебных символов на исходные троки с экранирующим слешем
 */
const esc = {}, text = {}, raw = {};
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