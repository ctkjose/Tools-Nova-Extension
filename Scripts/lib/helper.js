/**
Helper Utilities to interact with Nova

**/


exports.getConfig = function (key, type) {
	if(nova.workspace.config.get(key) != null) return nova.workspace.config.get(key, type);
	return nova.config.get(key, type)
}
exports.readFile = function(path){
	if (!nova.fs.access(path, nova.fs.R_OK)) return null
	try {
		const lines = nova.fs.open(path).readlines();
		return lines.length > 0 ? lines.join('\n') : null
	}catch(ex){
		console.log("[EXPW][TOOLS] ERROR failed to read \"%s\".", path);
		return "";
	}
}
exports.isPathOpen = function (path, workspace) {
	workspace = workspace || nova.workspace;
	const relative = workspace.relativizePath(path);
	return relative !== path && !relative.startsWith('../')
}


var shell = exports.shell = {};

var shell_cwd = nova.path.expanduser("~/");


exports.refresh = ()=> {
	var tEditor = null;
	if(nova.workspace.activeTextEditor){
		tEditor = nova.workspace.activeTextEditor;
		
		editor.insert = tEditor.insert.bind(tEditor);
		editor.save = tEditor.save.bind(tEditor);
		editor.moveToTop = tEditor.moveToTop.bind(tEditor);
		editor.moveToBottom = tEditor.moveToBottom.bind(tEditor);
		editor.moveToEndOfLine = tEditor.moveToBottom.bind(tEditor);
		editor.moveToBeginningOfLine = tEditor.moveToBottom.bind(tEditor);
	}
};

var _shell_cwd = null;
Object.defineProperty(shell, 'cwd', {
	enumerable: true, configurable: false,
	get(){
		if(_shell_cwd) return _shell_cwd;
		
		let editor = nova.workspace.activeTextEditor;
		if(!editor) return "";
		if(!editor.document){
			if(nova.workspace.path) return nova.workspace.path;
			return nova.path.expanduser("~/");
		}
	
		return nova.path.dirname(editor.document.path);
	}, set(value){
		_shell_cwd = value;
	}
});




async function syncExecute(cmd, params){
	var options = {
		args: params,
		cwd: shell.cwd,
		shell: true
		//stdio: ["pipe", "pipe", "pipe"],
	};
	
	var p = new Process(cmd, options);
	
	var results = "";
	p.onStdout( (line) => {
		console.log("line %s",line);
		results += line + "\n";
	});
	
	
	
	
	function execSync(){
		
	 	const promise = new Promise( (resolve, reject) => {
			p.onDidExit((status)=>{
				console.log("Process done Exit Value=%d\n%s", status, results);
				if(status==0){
					resolve(results);
				}else{
					reject(results);
				}
			});
			p.start();
		});
		
		return promise;
	}; 
	
	let v = await execSync();
	
	console.log("Leaving");
	
	return results;
};

shell.execute = syncExecute;

exports.process = function(cmd, params){
	var options = {
		args: params,
		cwd: shell.cwd,
		shell: true
	};
	
	let emitter = new Emitter();
	
	var p;
	
	var cProc = {
		exitCode: 0,
		process: p,
		results: "",
		stdErr: "",
		kill: function(signal){
			if(!p) return;
			if(signal != undefined){
				p.signal(signal);
			}else{
				p.kill(signal);
			}
		},
		terminate: function(){
			if(!p) return;
			p.terminate();
		},
		write: function(s){
			if(!p) return;
			const writer = p.stdin.getWriter();
			writer.ready.then(() => {
				writer.write(s);
				writer.close();
			});
		}
	};
	
	
		
	Object.defineProperty(cProc, 'pid', {
		enumerable: true, configurable: false,
		get(){ if(p) return p.pid; return 0; }
	});
	Object.defineProperty(cProc, 'shell', {
		enumerable: true, configurable: false,
		get(){ return options.shell },
		set(v){ options.shell = v; }
	});
	Object.defineProperty(cProc, 'cwd', {
		enumerable: true, configurable: false,
		get(){ return options.cwd },
		set(v){ options.cwd = v; }
	});
	
	cProc.on = emitter.on.bind(emitter);
	cProc.run = () => {
		p = new Process(cmd, options);
	
		p.onStdout( (line) => {
			cProc.results += line;
			emitter.emit("data", line);
		});
		
		p.onStderr( (line) => {
			cProc.stdErr += line;
			emitter.emit("stderr", line);
		});
		p.onDidExit( (status) => {
			cProc.exitCode = status;
			
			if(status != 0){
				emitter.emit("error", status);
			}
			emitter.emit("exit", status);
			emitter.emit("close", status);
		});
			
		return new Promise( (resolve, reject) => {
			emitter.on("close", (status)=> {
				if(status==0){
					resolve(cProc.results);
				}else{
					reject(cProc.results);
				}
			});
			
			p.start();
		});
		
	};
	
	return cProc;
};
	
var editor = {};

Object.defineProperty(editor, 'path', {
	enumerable: true, configurable: false,
	get(){
		let editor = nova.workspace.activeTextEditor;
		if(!editor) return "";
		
		return editor.document.path;
	}
});
Object.defineProperty(editor, 'filename', {
	enumerable: true, configurable: false,
	get(){
		let editor = nova.workspace.activeTextEditor;
		if(!editor) return "";
		
		return nova.path.basename(editor.document.path);
	}
});
Object.defineProperty(editor, 'directory', {
	enumerable: true, configurable: false,
	get(){
		let editor = nova.workspace.activeTextEditor;
		if(!editor) return "";
		
		return nova.path.dirname(editor.document.path);
	}
});

Object.defineProperty(editor, 'textEditor', {
	enumerable: true, configurable: false,
	get(){
		let editor = nova.workspace.activeTextEditor;
		return editor;
	}
});




editor.getSelectedText = function(){
	let editor = nova.workspace.activeTextEditor;
	if(!editor) return "";
	
	return editor.selectedText;
};
editor.insertText = function(text){
	let editor = nova.workspace.activeTextEditor;
	if(!editor) return;
	
	editor.insert(text);
};

editor.insertSnippet = function(string){
	let editor = nova.workspace.activeTextEditor;
	if(!editor) return;
	
	editor.insert(string, InsertTextFormat.Snippet);
};
editor.save = function(){
	let editor = nova.workspace.activeTextEditor;
	if(!editor) return;
	
	editor.save();
};

exports.editor = editor;