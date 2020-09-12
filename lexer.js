const Stack = require('@grunmouse/stack');

/**
 * Паттер имени 
 * Имя может быть валидным идентификатором, целым числом или произвольной строкой, заключённой в []
 */
const patName = '[A-Za-z_$][\\w$]*|\\d+|\\[[^\\]]+\\]';

/**
 * Паттерн подстановки
 * Находит целый макрос или начало макроса с параметрами
 * [raw, level, name, call]
 */
const patVaropen = `\\$(\\$*)\\{\\s*(${patName})\\s*(!|\\})`;

/**
 * Паттерн списка аргументов
 * Находит очередной аргумент или конец макроса
 * [raw, call, name] 
 */
const patArglist = `(\\})|(${patName})[^<]*<`;

/**
 * Паттерн текста аргумента
 * Находит вложенную подстановку или конец аргумента
 * [raw, level, name, call, endarg]
 */
const patArgText = `${patVaropen}|(>)`;

/**
 * Генератор токенов, найденных в строке
 */
function *lexer(str){
	const stack = new Stack();
	stack.push('text');
	let index = 0;
	while(index<str.length){
		switch(stack.top){
			case 'text':{
				//Ищем начало шаблона
				let reg = new RegExp(patVaropen, 'ug');
				reg.lastIndex = index-1;
				let match = reg.exec(str);
				if(match){
					//Нашли, отправляем предшествующий ему текст
					let prev = str.slice(index, match.index);
					yield {type:'text', raw:prev};
					let [raw, level, name, call] = match
					if(call === '}'){
						//Шаблон без аргументов
						yield {type:'macro', raw, level, name};
					}
					else{
						//Шаблон с аргументами
						yield {type:'generic', raw, level, name};
						//Переходим в режим сбора аргументов
						stack.push('arglist');
					}
					index = reg.lastIndex;
				}
				else{
					//Не нашли, шаблонов до конца нет, только статичный текст
					let prev = str.slice(index)
					//Отправляем остаток текста и завершаем работу
					yield {type:'text', raw:prev};
					return;
				}
			} break;
			case 'arglist':{
				//Ищем начало очередного аргумента или конец шаблона
				let reg = new RegExp(patArglist, 'ug');
				reg.lastIndex = index-1;
				let match = reg.exec(str);
				if(match){
					//Нашли, отправляем предшествующий ему текст
					let prev = str.slice(index, match.index);
					yield {type:'text', raw:prev};
					let [raw, call, name] = match;
					if(call){
						//Это конец шаблона, отправляем его и возвращаемся к сбору текста
						yield {type:'end generic', raw};
						stack.pop();
					}
					else if(name){
						//Это аргумент, мы получили его имя и позицию начала его значения
						yield {type:'arg', raw, name};
						stack.push('argtext');
					}
					index = reg.lastIndex;
				}
				else{
					//Нет конца шаблона, это ошибка, но лексическому анализатору нет до неё дела
					let prev = str.slice(index)
					//Отправляем остаток текста и завершаем работу
					yield {type:'error', raw:prev, message:'unclosed template'};
					return;
				}
			} break;
			case 'argtext':{
				//Ищем начало шаблона или конец аргумента
				let reg = new RegExp(patArgText, 'ug');
				reg.lastIndex = index-1;
				let match = reg.exec(str);
				if(match){
					//Нашли, отправляем предшествующий ему текст
					let prev = str.slice(index, match.index);
					yield {type:'text', raw:prev};
					let [raw, level, name, call, endarg] = match
					if(endarg){
						//Нашли конец аргумента, отправляем его и ищем следующий аргумент
						yield {type:'end arg', raw};
						stack.pop();
					}
					else if(call === '}'){
						//Нашли шаблон без аргументов
						yield {type:'macro', raw, level, name};
					}
					else{
						//Нашли шаблон с аргументами
						yield {type:'generic', raw, level, name};
						//Переходим в режим сбора аргументов
						stack.push('arglist');
					}
					index = reg.lastIndex;
				}
				else{
					//Нет конца аргумента это ошибка, но лексическому анализатору нет до неё дела
					let prev = str.slice(index)
					//Отправляем остаток текста и завершаем работу
					yield {type:'error', raw:prev, message:'unclose argument'};
					return;
				}
			}break;
				
		}
	}
	yield {type:'text', raw:str.slice(index)};
}

/**
 * Возможные возвращаемые объекты
 * {type:'text', raw} - статический текст
 * {type:'macro', raw, level, name} - шаблон без аргументов, level - строка из $ соответствующая глубине вложенности
 * {type:'generic', raw, level, name} - начало шаблона с аргументами
 * {type:'end generic', raw} - конец шаблона с аргументами
 * {type:'arg', raw, name} - заголовок аргумента
 * {type:'end arg', raw} - конец аргумента
 * {type:'error', raw, message} - невалидный код (неразобранный остаток строки)
 */

module.exports = lexer;