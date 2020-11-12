const {
	escape,
	compile,
	use
} = require('../index.js');

const assert = require('assert');

describe('format-recursive', ()=>{

	describe('escape', ()=>{
		it('exist', ()=>{
			assert.ok(escape);
		});
		
		it('escape', ()=>{
			let raw = ",\\,$,!,{,},<,>,[,]".split(',').map(a=>('\\'+a)).join(',') +','+",\\,$,!,{,},<,>,[,]";
			
			let esc = escape.escape(raw);
			
			assert.equal(esc, "\uE000,\uE001,\uE002,\uE003,\uE004,\uE005,\uE006,\uE007,\uE008,\uE009,,\uE000,$,!,{,},<,>,[,]");
		});
		
		it('getRaw', ()=>{
			let raw = ",\\,$,!,{,},<,>,[,]".split(',').map(a=>('\\'+a)).join(',') +','+",\\,$,!,{,},<,>,[,]";
			
			let esc = escape.escape(raw);
			
			let unesc = escape.getRaw(esc);
			
			assert.equal(unesc, raw);
		});

		it('toText', ()=>{
			let raw = ",\\,$,!,{,},<,>,[,]".split(',').map(a=>('\\'+a)).join(',') +','+",\\,$,!,{,},<,>,[,]";
			
			let esc = escape.escape(raw);
			
			let text = escape.toText(esc);
			
			assert.equal(text, ",\\,$,!,{,},<,>,[,]" + ','+",,$,!,{,},<,>,[,]");
		});
	});
	
	describe('use', ()=>{
		it('exist', ()=>{
			assert.ok(use);
		});
		
		it('sample', ()=>{
			let template = "sample text";
			
			assert.equal(use(template, {}), template);
		});
		
		it('sample with escape', ()=>{
			let template = "sample\\, sample text";
			
			assert.equal(use(template, {}), "sample, sample text");
		});
		
		it('variable', ()=>{
			let template = "${var} text";
			assert.equal(use(template, {'var':'injected'}), "injected text");
		});

		it('two variable', ()=>{
			let template = "${var} ${text}";
			assert.equal(use(template, {'var':'injected', text:'text'}), "injected text");
		});
		
		it('subformat', ()=>{
			let template = 'before ${sub!a<injected>}';
			
			assert.equal(use(template, {sub:'${a} text'}), 'before injected text');
		});
		
		it('subformat with variable', ()=>{
			let template = 'before ${sub!a<${arg}>}';
			
			let sub = '${a} text';
			
			assert.equal(use(template, {sub, arg:'argument'}), 'before argument text');
			
		});		
		
		it('subformat with inherited variable', ()=>{
			let template = 'before ${sub!}';
			
			let sub = '${a} text';
			
			assert.equal(use(template, {sub, a:'argument'}), 'before argument text');
			
		});
		
		it('macro', ()=>{
			let template = 'before $${sub!a<text>}';
			let sub = '${a} after';
			
			let result = use(template, {sub});
			
			assert.equal(result, 'before ${sub!a<text>}');
		});

		it('macro with subformat', ()=>{
			let template = 'before $${sub!a<text ${arg}>}';
			let sub = '${a} after';
			
			let result = use(template, {sub, arg:'inject'});
			
			assert.equal(result, 'before ${sub!a<text inject>}');
		});
		
		it('macro in argumetn', ()=>{
			let template = 'before ${sub!a<text $${arg}>}';
			let sub = '${a!arg<inner>} after';
			
			let result = use(template, {sub, arg:'inject'});
			
			assert.equal(result, 'before text inner after');
		});
		
	});

	describe('compile', ()=>{
		it('exist', ()=>{
			assert.ok(compile);
		});
		
		it('sample', ()=>{
			let template = "sample text";
			
			assert.equal(compile(template)({}), template);
		});
		
		it('sample with escape', ()=>{
			let template = "sample\\, sample text";
			
			assert.equal(compile(template)({}), "sample, sample text");
		});
		
		it('variable', ()=>{
			let template = "${var} text";
			assert.equal(compile(template)( {'var':'injected'}), "injected text");
		});

		it('two variable', ()=>{
			let template = "${var} ${text}";
			assert.equal(compile(template)( {'var':'injected', text:'text'}), "injected text");
		});
		
		it('subformat', ()=>{
			let template = 'before ${sub!a<injected>}';
			
			assert.equal(compile(template)( {sub:'${a} text'}), 'before injected text');
		});
		
		it('subformat with variable', ()=>{
			let template = 'before ${sub!a<${arg}>}';
			
			let sub = '${a} text';
			
			assert.equal(compile(template)( {sub, arg:'argument'}), 'before argument text');
			
		});		
		
		it('subformat with inherited variable', ()=>{
			let template = 'before ${sub!}';
			
			assert.equal(compile(template)( {sub:'${a} text', a:'argument'}), 'before argument text');
			assert.equal(compile(template)( {sub:'sub', a:'argument'}), 'before sub');
			
		});
		
	});

});