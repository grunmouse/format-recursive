
const makeGo = number => (stack, read, tocken)=>{
					stack.push(tocken);
					stack.push(number);
					return read();
				};

const makeReduce = (rule, Special) => (stack, read, tocken)=>{
				let [ntype, count] = rule;
				let data = [];
				for(let i=1; i<count; ++i){
					stack.pop();
					data.push(stack.pop());
				}
				data.reverse();
				data.push(tocken);
				let fun = Special[ntype];
				if(fun){
					data = fun(ntype, data);
				}
				return {type:ntype, data};
			}

function makeStates(states, reduce, Special){
	const result = {};
	for(let q of Object.keys(states)){
		let state = states[q];
		result[q] = {};
		for(let x of Object.keys(state)){
			let number = state[x];
			if(x[0] === "'"){
				x = x.slice(1,-1);
			}
			if(number in states){
				result[q][x] = makeGo(number);
			}
			else if(number in reduce){
				result[q][x] = makeReduce(reduce[number], Special);
			}
		}
		
	}
	return result;
}

module.exports = {
	makeGo,
	makeReduce,
	makeStates
};