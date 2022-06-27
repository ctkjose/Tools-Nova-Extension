const { ide, editor } = require('./helper');

var controller = {
	
	plugin: null,
	scripts: null,
	
	rootItems: [],
	pathScripts: "",
	tree:null,
	disposables:null,
	_editingTool:null,
	
	
	tools: {
		_isVirgin: true,
		items: null,
		hooks: {
			onSave: []
		},
	},
	getChildren(element) {
		// Requests the children of an element
		if(element.identifier == "fld_tools"){
			return this.getToolsItems();
		}
		
		return [];
	},
	getToolsItems: function(){
		var out = [];
		for([uid, tool] of this.scripts){
			out.push(tool);
		}
		
		out.sort((a, b) => {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			
			return a > b ? 1 : b > a ? -1 : 0;
		});
		
		return out;
	},
	toolRun: function(uid, hook, ctxData){
		
		//console.log("[EXW-TOOLS] UID=%s", uid);
		if(!this.scripts.has(uid)) return;
		var tool = this.scripts.get(uid);
		
		if(!hook)  hook = 'onAction';
		
		//console.log("[EXW-TOOLS] Running tool %s with hook %s", uid, hook);
		
		if(tool.hasOwnProperty(hook) && (typeof(tool[hook]) == 'function')){
			try{
				tool[hook]();
			}catch(err1){
				console.error("[EXW-TOOLS] Tool \"%s\" failed.", tool.uid);
			}
		}
	},
	newScript: function(){
		const pathTplScript = nova.path.join(nova.extension.path, 'assets', "template.js");
		
		nova.workspace.showInputPalette("Enter a name for the new tool", {value:"Untitled.js"}, (fname) => {
			if(!fname || fname.length == 0) return;
			
			const newFile = nova.path.join(this.pathScripts, fname);
			const fst = nova.fs.stat(newFile);
			if(fst){
				nova.workspace.showInformativeMessage('A script with the selected name already exists in your tools folder!');
				return;
			}
			
			nova.fs.copy(pathTplScript, newFile);
			
			nova.workspace.openFile(newFile);
		});
	},
	scriptReload: function(uid){
		if(!this.scripts.has(uid)) return;
		
		var entry = this.scripts.get(uid);
		
		var scriptTool = this.scriptCreateTool(entry.path);
		if(!scriptTool) return;
		
		if(scriptTool.uid != uid){
			ide.showAlert('Unable to reload tool script "' + entry.fileName + '"! The id for this tool changed. To reload this tool relaunch Nova.');
		}
		
		this.scripts.set(uid, scriptTool);
		
		this.plugin.folderReload(this.rootEntry);
	},
	scriptCreateTool: function(file){
		
		const pathTool = file;
		const fileName = nova.path.basename(file);
		
		const ext = fileName.substr(fileName.lastIndexOf('.') + 1);
		if(ext != "js") return null;
		
		var src = ide.readFile(pathTool);
		if(!src) return null;
		
		
		var js = this.toolWrapperCode;
		js = js.replace("%FILENAME%", pathTool);
		js = js.replace("%CODE%", src);
		//console.log(js); 
		
		
		var loadTool = null;
		try {
			eval(js);
		}catch(ex){
			console.log('[ERR501] Unable to wrap tool code for "%s".', fileName);
			return null;
		}
		
		if(!loadTool) return null;
		var tool = loadTool(ide, ide.editor);
		
		if(!tool) return null;
		
		if( !tool.hasOwnProperty("id") || (typeof(tool.id) != "string") || (!tool.id) ){
			console.error('[ERR502] Missing or invalid property "id" in file "%s".', fileName);
			return null;
		}
		if( !tool.hasOwnProperty("name") || (typeof(tool.name) != "string")  || (!tool.name) ){
			console.error('[ERR502] Missing or invalid property "name" in file "%s".', fileName);
			return null;
		}
		
		var uid = tool.id;
		
		let s = tool.name ? tool.name : uid;
		let tooltip = tool.tooltip ? tool.tooltip : null;
		
		var scriptTool = {
			//TreeView Entry Protocol
			type: "tool",
			uid: uid, 
			name: s,
			tooltip:tooltip,
			controller: this,
			
			icon: "tool",
			isFolder: false,
			isEditable: true, //can we show edit menu
			isActionable: true, //can we double click on it...
			folderState: TreeItemCollapsibleState.Collapsed,
			
			path: pathTool, 
			fileName: fileName,
			
			//private properties
			ctx: tool,
		};
		
		//todo remove this
		const createHook = (fn)=>{
			var src = fn.toString();
			
			const regex = /^\s*(.*)\s*\{\s*/gm;
			let m = regex.exec(src);
			if(!m){
				return null;
			}
			
			src = src.replace( m[0], "\n");
			
			var fnH = m[1] + "{\n";
			//fnH += "console.log('wrapper here');\n";
			
			src = fnH + src;
			//console.log(src);
			var fn = null;
			try {
				eval("fn = " + src + ";");
			}catch(ex){
				return null;
			}
			
			if(!fn) return null;
			
			fn = fn.bind(tool); 
			return fn;
		};
		
		
		if(tool.onAction && (typeof(tool.onAction) == 'function')){
			scriptTool.onAction = createHook(tool.onAction);
			
		}
		if(tool.onSave && (typeof(tool.onSave) == 'function')){
			scriptTool.onSave = createHook(tool.onSave);
		}
		
		
		return scriptTool;
	},
	scriptAdd: function(file){
		
		const pathTool = file;
		const fileName = nova.path.basename(file);
		
		const ext = fileName.substr(fileName.lastIndexOf('.') + 1);
		if(ext != "js") return;
		
		var src = ide.readFile(pathTool);
		if(!src) return;
		
		
		var scriptTool = this.scriptCreateTool(file);
		if(!scriptTool) return;
		
		if( this.scripts.has(scriptTool.uid) ){
			console.error('EXW TOOL [ERR501] Error Missing property "id" in file "%s".', fileName);
			ide.showAlert('The tool script "' + fileName + '" was not loaded. The id for this tool is already used by another tool.');
			return null;
		}
		
		
		
		this.scripts.set(scriptTool.uid, scriptTool);
	},
	loadScripts: function(){
		
		//check if we have a script directory
		if (!nova.fs.access(this.pathScripts, nova.fs.F_OK)) {
			nova.fs.mkdir(this.pathScripts);
			
			const pathTplScript = nova.path.join(nova.extension.path, 'assets', "template.js");
			nova.fs.copy(pathTplScript, nova.path.join(this.pathScripts, "MyTool.js"));
		}
		
		const paths = nova.fs.listdir(this.pathScripts);
		
		for(var i=0; i<paths.length; i++){
			var file = paths[i];
			file = nova.path.join(this.pathScripts, file);
			
			//console.log("file=%s",file);
			const fst = nova.fs.stat(file);
			if(!fst || fst.isDirectory()) continue;
			this.scriptAdd(file);
		}
	},
	onEdit: function(entry){
		
	},
	onDoubleClick: function(entry){
		if(!entry) return;
		
		console.log("contextValue \"%s\".", entry.uid);
		if(entry.type == "tool"){
			this.toolRun(entry.uid);
		}else if(entry.type == "cmd"){
			if(entry.uid == "cmd_reveal_tools"){
				this.plugin.ide.revealInFinder(this.pathScripts);
			}
		}
	},
	onReload: function(){
		this.scripts = new Map();
		this.loadScripts();
	},
	onGetChildren: function(entry){
		var out = [];
		
		if(entry.uid == "fld_tools"){
			for([uid, tool] of this.scripts){
				console.log("")
				out.push(tool);
			}
			
			out.sort((a, b) => {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				
				return a > b ? 1 : b > a ? -1 : 0;
			});
		}
		
		return out;
	},
	onInstall: function(){
		
	},
	onInit: function(plugin){
		
		this.plugin = plugin;
		
		this.scripts = new Map();
		this.pathScripts = nova.path.join(nova.extension.globalStoragePath, 'tools');
	
		if (!nova.fs.access(this.pathScripts, nova.fs.F_OK)) {
			nova.fs.mkdir(this.pathScripts);
			
			const pathTplScript = nova.path.join(nova.extension.path, 'assets', "template.js");
			nova.fs.copy(pathTplScript, nova.path.join(this.pathScripts, "MyTool.js"));
			
			const pathScript1 = nova.path.join(nova.extension.path, 'assets', "stringEncode.js");
			nova.fs.copy(pathScript1, nova.path.join(this.pathScripts, "stringEncode.js"));
			
		}
		
		const scriptScopePath = nova.path.join(nova.extension.path, 'assets', "toolWrapper.js");
		const src = ide.readFile(scriptScopePath);
		if(src) this.toolWrapperCode = src;
		
		
		this.loadScripts();
		
		this.rootEntry = {
			type: "fld_tools",
			uid: "fld_tools", 
			name: "Tasks",
			tooltip: "Tasks...",
			controller: this,
			
			icon: "folder-color",
			isFolder: true,
			isEditable: false, //can we show edit menu
			isActionable: false, //can we double click on it...
		};
		
		plugin.addRootItem( this.rootEntry );
		
		
		
		
		plugin.ide.on("doc-saved", (textEditor)=>{
			let path = textEditor.document.path;
			
			console.log("scripts onDocSaved %s", path);
			var toolsWithOnSave = [];
			for([uid, tool] of this.scripts){
				if(tool.path == path){
					this.scriptReload(tool.uid);
					return;
				}else if(tool.onSave){
					toolsWithOnSave.push(tool);
				}
			}
			
			for(tool of toolsWithOnSave){
				tool.onSave(path, textEditor);
			}
		});

	},
	
};

exports.controller = controller;