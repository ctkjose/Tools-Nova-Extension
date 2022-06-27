
grammers = {
	//#MARK js
	'source.js': {
		id:'source.js',
		start_scope: /(\/\/.*)?$/,
		end_scope: /\s*}\s*[,;]?/,
		comments: {
			block_start: /^\s*\/\*/,
			block_end: /\s*\*\/$/,
			single_line: /^\s*\/\//,
		},
		//regexExpansions allows to use simpler syntax in regex by expanding common notations
		//`m` is the string to match and replace with p
		regexExpansions: [
			{m: /\./g, p: '\\.'},
			{m: /\*/g, p: '.*?'},
			{m: / : /g, p: '\\s*\\:\\s*'},
			{m: / = /g, p: '\\s*\\=\\s*'},
			{m: / \}/g, p: '\\}' },
	        {m: / \{$/g, p: '(?:\\s*\\{\\s*$|\s*$|\\s*\\{.*?\\}\\s*[,;]?\\s*$)' },
			{m: /name/g, p: '(id)'},

			{m: /id/g, p: '[a-zA-Z_$][.a-zA-Z0-9_$]*'},
			{m: /:type/, p:'(?:\\s*:\\s*[a-zA-Z\\*]+\\s*)?'},
			{m: /\(\)/g, p:'\\s*(?=\\().+\\)\\s*'},
			{m: /\/\/\#/g, p:'\\/\\/\\#'}
		],
		pragma: [
			{re: /^\s*\/\/#MARK\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*$/, icon:'exw-icn-mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#TODO\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
			{re: /^\s*\/\/\#(TODO)\s+.*?$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
		],
		//symbols are the definitions of symbols
		//`t` is the type, `block` is block, `p` the pattern to match
		symbols: [
			{block: true, re: /^\s*class\s+([a-zA-z0-9\_]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, p: 'var name = {', icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, p: 'name : {', icon:'exw-icn-prop-obj', class:['ide-sym-obj'], symType: 'sym-prop-obj'},
	        {block: true, p: 'name : function() {', icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-prop-fn'},
			{block: true, p: 'name = {', icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, p: 'let name = {', icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, p: 'self.name = {', icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},


			//let name = (params) => {}
			{block: true, re: /let\s+([a-zA-Z_$][.a-zA-Z0-9_$]*)\s*=\s*\([^\)]*\)\s*=>\s*\{\s*/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				symType: 'sym-fn',
			},
			//var name = (params) => {}
			{block: true, re: /var\s+([a-zA-Z_$][.a-zA-Z0-9_$]*)\s*=\s*\([^\)]*\)\s*=>\s*\{\s*/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				symType: 'sym-fn',
			},
			{block: true, re: /this.([a-zA-Z_$][.a-zA-Z0-9_$]*)\s*=\s*\([^\)]*\)\s*=>\s*\{\s*/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				symType: 'sym-fn',
			},
			{block: true, re: /this.([a-zA-Z_$][.a-zA-Z0-9_$]*)\s*=\s*\([^\)]*\)\s*=>\s*\{\s*/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				symType: 'sym-fn',
			},
			{block: true, re: /^\s*([\_\$a-zA-Z][a-zA-z0-9\_]+)\s*\((?![\(\)])[\_\$a-zA-Z0-9\s\,]+\)\s*\{\s*$/,
				exclude: [/^if$/i, /^do$/i, /^while$/i, /^for$/i, /^else$/i, /^switch$/i, /^case$/i],
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				symType: 'sym-prop-fn',
			},
			{block: true, when:(item, parent)=>{ return (parent.symType == 'sym-obj'); }, re:  /^\s*([a-zA-Z_$][.a-zA-Z0-9_$]*)\s*\:\s*\([^\)]*\)\s*=>\s*\{\s*/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				symType: 'sym-prop-fn',
			},

			//functions

			{block:true, re: /^\s*\(\s*(function)\s*(?=\().+\)\s*\{/, icon:'exw-icn-fn', class:['ide-sym-fn', 'nst-italic'], title:'IIFE', symType: 'sym-fn'},

			{block:true, re: /^\s*function\s*\*?([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /.*?([a-zA-z0-9\_]+)\s*=\s*function\s*\*?\s*(?=\().+\)\s*\{/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},


			{block:true, when:(item, parent)=>{ return (parent.symType == 'sym-obj'); }, re: /^\s*\*?\s*([a-zA-z0-9\_]+)\*(?=\().+\)\s*{/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*static\*?\s*([a-zA-z0-9\_]+)(?=\().+\)\s*{/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},


			{block:true, p:'export default class name', icon:'exw-icn-module', class:['ide-sym-module'], symType: 'sym-module'},
			{block:true, re:/\s*export\s*(default)\s*\{/, icon:'exw-icn-module', class:['ide-sym-module'], symType: 'sym-module'},

		],
		factory: function(lineState, mark){
			//console.log('@js-sym-grammer factory %o', mark);
			if(!mark) return false;
		}
	},
	//#MARK php
	'source.php': {
		id:'source.php',
		start_scope: /\s*{\s*((\/\/|\#).*)?$/,
		end_scope: /\s*}\s*[,;]?/,
		comments: {
			block_start: /^\s*\/\*/,
			block_end: /\s*\*\/$/,
			single_line: /^\s*\/\//,
		},
		//regexExpansions allows to use simpler syntax in regex by expanding common notations
		//`m` is the string to match and replace with p
		regexExpansions: [
			{m: /\./g, p: '\\.'},
			{m: /\*/g, p: '.*?'},
			{m: / : /g, p: '\\s*\\:\\s*'},
			{m: / = /g, p: '\\s*\\=\\s*'},
			{m: / \}/g, p: '\\}' },
	        {m: / \{$/g, p: '(?:\\s*\\{\\s*$|\s*$|\\s*\\{.*?\\}\\s*[,;]?\\s*$)' },
			{m: /name/g, p: '(id)'},
			{m: /id/g, p: '[a-zA-Z_$][.a-zA-Z0-9_$]*'},
			{m: /:type/, p:'(?:\\s*:\\s*[a-zA-Z\\*]+\\s*)?'},
			{m: /\(\)/g, p:'\\s*(?=\\().+\\)\\s*'},
			{m: /\/\/\#/g, p:'\\/\\/\\#'}
		],
		pragma: [

			{re: /^\s*\/\/#MARK\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*$/, icon:'exw-icn-mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#TODO\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
			{re: /^\s*\/\/\#(TODO)\s+.*?$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
		],
		//symbols are the definitions of symbols
		//`t` is the type, `block` is block, `p` the pattern to match
		symbols: [
			{block: true, re: /^\s*abstract\s+class\s+([a-zA-z0-9\_]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, re: /^\s*namespace\s*([a-zA-z\_\\][a-zA-z0-9\_\\]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, re: /^\s*class\s+([a-zA-z0-9\_]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, re: /^\s*class\s+([a-zA-z0-9\_]+)\s*extends\s*([a-zA-z\_\\][a-zA-z0-9\_\\]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, re: /^\s*trait\s+([a-zA-z0-9\_]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj'], symType: 'sym-obj'},
			{block: true, re: /^\s*interface\s+([a-zA-z0-9\_]+)\s*/, icon:'exw-icn-obj', class:['ide-sym-obj', 'nst-italic'], symType: 'sym-obj'},

			//functions
			{block:true, re: /^\s*(\$[.a-zA-Z0-9_$]*)\s*\=\s*function\s*(?=\().+\)\s*\{/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*private\s+function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*public\s+function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*protected\s+function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*private\s+static\s+function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*public\s+static\s+function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},
			{block:true, re: /^\s*protected\s+static\s+function\s*([a-zA-z0-9\_]+)\s*(?=\().+\)/, icon:'exw-icn-fn', class:['ide-sym-fn'], symType: 'sym-fn'},

		],
		factory: function(lineState, mark){
			if(!mark) return false;
		}
	},
	//#MARK css
	'source.css': {
		id:'source.css',
		start_scope: /\s*{\s*((\/\/|\#).*)?$/,
		end_scope: /\s*}\s*[,;]?/,
		comments: {
			block_start: /^\s*\/\*/,
			block_end: /\s*\*\/$/,
			single_line: /^\s*\/\//,
		},
		symbols: [
			{re: /^\s*([#\.]([^{]+))\s*\{\s*$/, icon:'exw-icn-style', class:['ide-sym-css-style'], symType: 'sym-css-style'},
			//{re: /^\s*\@import\s+['"](([a-zA-Z0-9\.\/\-\_]+))['"]\;/, icon:'exw-icn-scssimport', class:['ide-sym-css-style'], symType: 'sym-less-import'},
			{re: /^\s*(([^{]+))\s*\{\s*$/, icon:'exw-icn-style', class:['ide-sym-css-style'], symType: 'sym-css-style'},
			{re: /^\s*(\$([^\:]+))\s*\:/, icon:'exw-icn-scssvar', class:['ide-sym-css-style-prop'], symType: 'sym-css-prop'},
			{re: /^\s*@mixin\s+([a-zA-z0-9\_\-]+)\s*(?=\().+\)\s*\{/, icon:'exw-icn-scssvar', class:['ide-sym-css-style-prop'], symType: 'sym-css-prop'},
		],
		pragma: [
			{re: /^\s*\/\*\s+#MARK\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'exw-icn-mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^^\s*\/\*\s+#TODO\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
		],
		regexExpansions: [
			{m: /\./g, p: '\\.'},
			{m: /\*/g, p: '.*?'},
			{m: / : /g, p: '\\s*\\:\\s*'},
			{m: / = /g, p: '\\s*\\=\\s*'},
			{m: / \}/g, p: '\\}' },
	        {m: / \{$/g, p: '(?:\\s*\\{\\s*$|\s*$|\\s*\\{.*?\\}\\s*[,;]?\\s*$)' },
			{m: /name/g, p: '(id)'},
			{m: /id/g, p: '[a-zA-Z_$][.a-zA-Z0-9_$]*'},
			{m: /:type/, p:'(?:\\s*:\\s*[a-zA-Z\\*]+\\s*)?'},
			{m: /\(\)/g, p:'\\s*(?=\\().+\\)\\s*'},
			{m: /\/\/\#/g, p:'\\/\\/\\#'}
		],
		factory: function(lineState, mark){

			if(!mark) return false;
			if(/^this\.[a-zA-Z0-9_]*$/){
				mark.title = mark.title.replace("this.","");
			}

			if(mark.symType == "sym-less-import"){
				mark.title = '@import(' + mark.title + ')';
			}
			if(mark.symType == "sym-fn"){
				mark.title += '()';
			}

			return true; //return true to add
		},
	},
	//#MARK c
	'source.c': {
		id:'source.c',
		start_scope: /\s*{\s*((\/\/|\#).*)?$/,
		end_scope: /\s*}\s*[,;]?/,
		scope_glue: [
			{	when: /([A-Za-z\_][a-zA-z0-9\_]*)\s*(?=\().+\)\s*$/,
				need: /^\s*{\s*$/
			},
			{	when: /struct\s*([A-Za-z\_][a-zA-z0-9\_]*)\s*$/,
				need: /^\s*{\s*$/
			},
		],
		comments: {
			block_start: /^\s*\/\*/,
			block_end: /\s*\*\/$/,
			single_line: /^\s*\/\//,
		},
		//regexExpansions allows to use simpler syntax in regex by expanding common notations
		//`m` is the string to match and replace with p
		regexExpansions: [
			{m: /\./g, p: '\\.'},
			{m: /\*/g, p: '.*?'},
			{m: / : /g, p: '\\s*\\:\\s*'},
			{m: / = /g, p: '\\s*\\=\\s*'},
			{m: / \}/g, p: '\\}' },
	        {m: / \{$/g, p: '(?:\\s*\\{\\s*$|\s*$|\\s*\\{.*?\\}\\s*[,;]?\\s*$)' },
			{m: /name/g, p: '(id)'},
			{m: /id/g, p: '[a-zA-Z_$][.a-zA-Z0-9_$]*'},
			{m: /:type/, p:'(?:\\s*:\\s*[a-zA-Z\\*]+\\s*)?'},
			{m: /\(\)/g, p:'\\s*(?=\\().+\\)\\s*'},
			{m: /\/\/\#/g, p:'\\/\\/\\#'}
		],
		pragma: [

			{re: /^\s*\/\/#MARK\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*$/, icon:'exw-icn-mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#TODO\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
			{re: /^\s*\/\/\#(TODO)\s+.*?$/, icon:'icon-unverified', class:'ide-sym-mark', symType: 'sym-todo'},
		],
		//symbols are the definitions of symbols
		//`t` is the type, `block` is block, `p` the pattern to match
		symbols: [
			{block: true, re: /^\s*struct\s+([a-zA-z0-9\_]+)\s*\{\s*/, icon:'exw-icn-obj', class:['ide-sym-obj', 'nst-italic'], symType: 'sym-obj'},
			{block: true, re: /^typedef\s*struct\s+([a-zA-z0-9\_]+)\s*\{\s*/, icon:'exw-icn-obj', class:['ide-sym-obj', 'nst-italic'], symType: 'sym-obj'},
			{block: false, reIdx:-1, re: /^typedef\s*struct\s+([a-zA-z0-9\_]+)\s*\*{0,5}?\s*([a-zA-z0-9\_]+)\s*;\s*/, icon:'exw-icn-obj', class:['ide-sym-obj', 'nst-italic'], symType: 'sym-obj'},

			{block: false, symType: 'sym-prop-obj',
				reIdx:-1, //use last group matched
				re: /^\s*((static|extern)\s+)?((void|int|char|short|long|float|double)|([A-Za-z\_][a-zA-z0-9\_]+[\s+\*]))(\s?\*{1,3})?\s*([A-Za-z\_][a-zA-z0-9\_]*)\s*;/,
				icon:'exw-icn-prop-obj',
				class:['ide-sym-obj'],
				exclude: [/^if$/i, /^do$/i, /^while$/i, /^for$/i, /^else$/i, /^switch$/i, /^case$/i]
			},
			//functions
			{block: false, symType: 'sym-fn',
				reIdx:-1, //use last group matched
				re: /^\s*((static|extern)\s+)?((void|int|char|short|long|float|double)|([A-Za-z\_][a-zA-z0-9\_]+[\s+\*]))(\s?\*{1,3})?\s*([A-Za-z\_][a-zA-z0-9\_]*)\s*(?=\().+\)\s*;/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				exclude: [/^if$/i, /^do$/i, /^while$/i, /^for$/i, /^else$/i, /^switch$/i, /^case$/i]
			},
			{block: true, symType: 'sym-fn',
				reIdx:-1, //use last group matched
				re: /^\s*((static|extern)\s+)?((void|int|char|short|long|float|double)|([A-Za-z\_][a-zA-z0-9\_]+[\s+\*]))(\s?\*{1,3})?\s?([A-Za-z\_][a-zA-z0-9\_]*)\s*(?=\().+\)\s*\{/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				exclude: [/^if$/i, /^do$/i, /^while$/i, /^for$/i, /^else$/i, /^switch$/i, /^case$/i]
			},
			{block: true, symType: 'sym-fn',
				reIdx:-1, //use last group matched
				re: /^\s*((static|extern)\s+)?((void|int|char|short|long|float|double)|([A-Za-z\_][a-zA-z0-9\_]+[\s+\*]))(\s?\*{1,3})?\s?([A-Za-z\_][a-zA-z0-9\_]*)\s*(?=\().+\)\s*;/,
				icon:'exw-icn-fn',
				class:['ide-sym-fn'],
				exclude: [/^if$/i, /^do$/i, /^while$/i, /^for$/i, /^else$/i, /^switch$/i, /^case$/i]
			},


		],
		factory: function(lineState, mark){
			if(!mark) return false;
		}
	}

};

grammers['text.html.php'] = grammers['source.php'];
grammers['source.css.less'] = grammers['source.css'];
grammers['source.css.scss'] = grammers['source.css'];
grammers['source.ccp'] = grammers['source.c'];
