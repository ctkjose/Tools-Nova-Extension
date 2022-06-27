/**
Helper Utilities to interact with Nova

**/


var objSerializer = exports.objSerializer = function(objIn, ops){
	//serialize plain objects
	var visited = [];
	var ignoreKeys = [];
	
	var ic = 0;
	let ident = (e)=>{
		var s = "";
		for(let i=1; i<=ic; i++) s+= "\t";
		return s + e;	
	};
	if(ops && ops.ignoreKeys && Array.isArray(ops.ignoreKeys)){
		ignoreKeys.push.apply(ignoreKeys, ops.ignoreKeys);
	}
	
	
	let getValue = (v) => {
		let t = typeof(v);
		
		var out = "";
		
		if(t=="undefined"){
			return "undefined";
		}else if(t=="number"){
			return v.toString();
		}else if(t=="string"){
			return JSON.stringify(v);
		}else if(t=="function"){
			return v.toString();
		}else if(t=="object"){
			if(v === null){
				return "null";
			}else if(Array.isArray(v)){
				return serializeArray(v);
			}else{
				console.log("\tSerialize Obj=================");
				return serialize(v);
			}
		}else{
			return "null";
		}
	
		
	};
	
	let serializeArray = (a) => {
		var out = [];
		
		ic++;
		for(let v of a){
			out.push(ident(getValue(v)));
		}
		ic--;
		
		return "[\n" + out.join(",\n") + "\n" + ident("]");
	};
	
	let serialize = (obj) => {
		
		if(Array.isArray(obj)){
			return serializeArray(obj);
		}
		if(obj === null){
			return "null";
		}
		
		
		//if(visited.indexOf(obj) >= 0){
		//	return "null";
		//}
		//visited.push(obj);
		
		let keys = 	Object.keys(obj);
		
		ic++;
		var out = [];
		var e = "";
		
		const regex = /^[A-Z_$][A-Z0-9_$]*$/im;
		
		for(let k of keys){
			//console.log("Key %s", k);
			if(ignoreKeys.indexOf(k) >= 0) continue;
			
			if ((m = regex.exec(k)) === null) {
				e = '"' + k + '":';
			}else{
				e = k + ":";
			}
			
			e = e + getValue(obj[k]);
			
			out.push(ident(e));
		}
		
		ic--;
		return "{\n" + out.join(",\n") + "\n" + ident("}");
	};
	
	return serialize(objIn);
};


var ide = exports.ide = {
	emitter:null,
	disposables: null,
	data: {}, //document data
	
	lastActive: null,
	timerCheckActive: null,
	
	initActiveEditorTracking: function(){
		this.timerCheckActive = setInterval(()=>{
			if( nova.workspace.activeTextEditor != this.lastActive){
				if(this.lastActive) this.emitter.emit('doc-blur', this.lastActive);
				
				this.lastActive = nova.workspace.activeTextEditor;
				this.emitter.emit('doc-focus', this.lastActive);
				
			}
			
			
		}, 200);
	},
	init: function(){
		this.emitter = new Emitter();
		this.disposables = new CompositeDisposable();
		
		this.initActiveEditorTracking();
		

		this.disposables.add( nova.workspace.onDidAddTextEditor((aTextEditor)=>{
			if(!aTextEditor) return;
			
			let editor = aTextEditor;
			
			this.emitter.emit('doc-added', editor);
			this.handleEditorChange(editor);
			this.disposables.add( editor.onDidSave( (editor)=> {
				this.handleEditorSave(editor);				
			}));
			
			this.disposables.add( editor.onDidDestroy( (editor)=> {
				this.emitter.emit('doc-destroyed', editor );			
			}));
			
			
			this.disposables.add( editor.document.onDidChangeSyntax( (doc, syntax)=> {
				this.emitter.emit('doc-syntax-changed', editor, syntax);
				console.log("Syntax Changed %s")			
			}));
		}));
	},
	createID: function(){
		const id = Math.random().toString(16).slice(2).toUpperCase() + '-' + Date.now().toString();
		return id;
	},
	setKey: function(k, v){
		this.data[k] = v;
	},
	getKey: function(k, defaultValue){
		if(this.data.hasOwnProperty(k)){
			return this.data[k];	
		}
		return defaultValue;
	},
	hasKey: function(k){
		return this.data.hasOwnProperty(k);
	},
	dispose: function(){
		clearInterval(this.timerCheckActive);
		this.disposables.dispose();
	},
	handleEditorChange: function(editor){
		this.emitter.emit('doc-changed', editor);
	},
	handleEditorSave: function(editor){
		this.emitter.emit('doc-saved', editor);
	},
	showAlert: function(msg){
		nova.workspace.showInformativeMessage(msg);
	},
	showNotification: function (title, message){
		const request = new NotificationRequest(this.createID());
		
		request.title = title;
		request.body = message;
		
		console.log(message);
		nova.notifications.add(request);
	},
	imageForExtension: function(ext){
		switch(ext){
			case "png":
			case "jpg":
			case "svg":
			case "bmp":
			case "gif":
				return "file-img";
				break;
			case "html":
			case "htm":
				return "file-html";
				break;
			case "php":
			case "sphp":
				return "file-php";
				break;
			case "c":
			case "m":
				return "file-c";
				break;
			case "cpp":
				return "file-cpp";
				break;
			case "css":
				return "file-css";
				break;
			case "scss":
				return "file-sass";
				break;
			case "less":
				return "file-less";
				break;
			case "js":
				return "file-js";
				break;
			case "json":
				return "file-json";
				break;
			case "md":
				return "file-md";
				break;
			case "swift":
				return "file-swift";
				break;
		}
		
		return "file";
	},
	on: function(eventName, fn){
		ide.emitter.on(eventName, fn);
	},
	revealInFinder: function(path){
		try {
			const p = new Process("/usr/bin/open", {"shell":true, "args":["-R", path]});
			p.start();
		}catch(err){
			console.log("[EXPW][TOOLS][ERROR] Unable to reveal \"%s\".", path);
		}
	},
	getConfig: function (key, type) {
		if(nova.workspace.config.get(key) != null) return nova.workspace.config.get(key, type);
		return nova.config.get(key, type)
	},
	writeFile: function(path, data){
		var file = nova.fs.open(path, "w", "utf8");
		if (!nova.fs.access(path, nova.fs.W_OK)) return false;
		if(file){
			file.write(data, "utf8");
		}
		file.close();
		
		return true;
	},
	readFile: function(path){
		if (!nova.fs.access(path, nova.fs.R_OK)) return null
		try {
			const lines = nova.fs.open(path).readlines();
			return lines.length > 0 ? lines.join('\n') : null
		}catch(ex){
			console.log("[EXPW][TOOLS] ERROR failed to read \"%s\".", path);
			return "";
		}
	},
	isPathOpen: function(path, workspace) {
		workspace = workspace || nova.workspace;
		const relative = workspace.relativizePath(path);
		return relative !== path && !relative.startsWith('../')
	}
};





ide.getFileInfo = function(path){
	
	var f = {
		name:"",
		path: path,
		ext: "",
		exists: false,
		isDirectory: false,
		isWritable: false,
		isReadable: false,
		isSymbolicLink: false,
		isExecutable:false,
		icon: "file",
		mode: "",
		size: 0,
	};
	
	//console.log("listing %s", path);
	f.name = nova.path.basename(path);
	f.ext = f.name.substr(f.name.lastIndexOf('.') + 1).toLowerCase();
	
	
	if (nova.fs.access(path, nova.fs.F_OK)) {
		f.exists = true;
	}
	if (nova.fs.access(path, nova.fs.R_OK)) {
		f.isReadable = true;
	}
	if (nova.fs.access(path, nova.fs.W_OK)) {
		f.isWritable = true;
	}
	if (nova.fs.access(path, nova.fs.X_OK)) {
		f.isExecutable = true;
	}
	
	const fst = nova.fs.stat(path);
	if(fst){
		f.size = fst.size;
		f.mode = fst.mode;
		f.isDirectory = fst.isDirectory();
		f.isSymbolicLink = fst.isSymbolicLink();
	}
	
	if(f.isDirectory){
		f.icon = "folder-color";
	}else{
		f.icon = this.imageForExtension(f.ext);
	}
	return f;
}

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

ide.process = function(cmd, params){
	var options = {
		args: params,
		cwd: "",
		shell: true
	};
	
	options.cwd = nova.path.expanduser("~/");
	let textEditor = nova.workspace.activeTextEditor;
	if(textEditor  && textEditor.document){
		options.cwd = nova.path.dirname(textEditor.document.path);
	}
	
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

Object.defineProperty(editor, 'text', {
	enumerable: true, configurable: false,
	get(){
		let editor = nova.workspace.activeTextEditor;
		if(!editor) return "";
		let d = editor.document;
		
		if( !d || d.isEmpty ) return "";
		
		return d.getTextInRange(new Range(0, d.length));
	}, set(v){
		
		
	}
});

Object.defineProperty(editor, 'syntax', {
	enumerable: true, configurable: false,
	get(){
		let editor = nova.workspace.activeTextEditor;
		if(!editor) return "";
		
		return editor.document.syntax;
	}
});
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

Object.defineProperty(ide, 'editor', {
	enumerable: true, configurable: false,
	get(){
		return editor;
	}
});

exports.editor = editor;