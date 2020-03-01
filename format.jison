
%lex
\\.						return 'escape';
<text>"$"+				return 'buck';
<text>"{"				{this.begin('template'); return '{'}

[A-Za-z_$][A-Za-z_$\d]*	return 'name';
"$"+"{"					return 'callopen';
"}"						return 'callclose';
"<"						return 'tmpopen';
">"						return 'tmpclose';
"["						return 'ecranopen';
"]"						return 'ecranclose';

/lex