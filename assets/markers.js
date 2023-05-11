config = {
	//#MARK js
	"javascript": {
		id:"javascript",
		marks: [
			{re: /^\s*\/\*\s+\!\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/\s*MARK\:\s*([A-Za-z\_$]+)/m, icon:'mark', class:'mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#MARK\s*([A-Z_$](\s*[\.A-Z0-9_$\-\:\>\,\;\!\?])*)\s*$/im, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#TODO\s*([A-Z_$](\s*[\.A-Z0-9_$\-\:\>\,\;\!\?])*)\s*$/im, icon:'todo', class:'ide-sym-mark', symType: 'sym-todo'},
		]
	},
	"exjs": {
		id:"exjs",
		marks: [
			{re: /^\s*\/\*\s+\!\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/\s*MARK\:\s*([A-Za-z\_$]+)/m, icon:'mark', class:'mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#MARK\s*([A-Z_$](\s*[\.A-Z0-9_$\-\:\>\,\;\!\?])*)\s*$/im, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#TODO\s*([A-Z_$](\s*[\.A-Z0-9_$\-\:\>\,\;\!\?])*)\s*$/im, icon:'todo', class:'ide-sym-mark', symType: 'sym-todo'},
		]
	},
	"php": {
		id:"php",
		marks: [
			{re: /^\s*\/\*\s+\!\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/\s*MARK\:\s*([A-Za-z\_$]+)/m, icon:'mark', class:'mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#MARK\s*([A-Z_$](\s*[\.A-Z0-9_$\-\:\>\,\;\!\?])*)\s*$/im, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\/#TODO\s*([A-Z_$](\s*[\.A-Z0-9_$\-\:\>\,\;\!\?])*)\s*$/im, icon:'todo', class:'ide-sym-mark', symType: 'sym-todo'},
		]
	},
	"css": {
		id:"css",
		marks: [
			{re: /^\s*\/\*\s+\!\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\*\s+#MARK\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'mark', class:'ide-sym-mark', symType: 'sym-mark'},
			{re: /^\s*\/\*\s+#TODO\s*([a-zA-Z_$](\s*[\.a-zA-Z0-9_$\-\:\>\,\;])*)\s*\*\/$/, icon:'todo', class:'ide-sym-mark', symType: 'sym-todo'}
		]
	}
};

