const Stack = require('@grunmouse/stack');




function asIs(obj, env){
	return obj.data.map((item)=>{
		if(item.type === 'text'){
			return item.raw;
		}
		else{
			return mapping[item.type](item, env);
		}
	});
}




const mapping = {
	MAIN:asIs,
	ARGTEXT:asIs,
	
};

/**
 * @param ast - структура, построенная синтаксическим анализатором
 */
function compil(ast){
	
}