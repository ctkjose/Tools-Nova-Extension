
var treeView = null;

function replaceAll(string, search, replace) {
 	return string.split(search).join(replace);
}

const helper = require('./lib/helper'); 

exports.activate = function() {
    // Do work when the extension is activated
    
	exwTools.init();
	
	/*
    // Create the TreeView
    treeView = new TreeView("mysidebar", {
        dataProvider: new FruitDataProvider()
    });
    
    treeView.onDidChangeSelection((selection) => {
        // console.log("New selection: " + selection.map((e) => e.name));
    });
    
    treeView.onDidExpandElement((element) => {
        // console.log("Expanded: " + element.name);
    });
    
    treeView.onDidCollapseElement((element) => {
        // console.log("Collapsed: " + element.name);
    });
    
    treeView.onDidChangeVisibility(() => {
        // console.log("Visibility Changed");
    });
    */
	
    // TreeView implements the Disposable interface
    //nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
   exwTools.disposables.dispose(); //like in atom
}






var pStore = nova.extension.globalStoragePath;
//nova.workspace.showInformativeMessage("alive=" + pStore);
var exwTools = {
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
	getTreeItem(element) {
		// Converts an element into its display (TreeItem) representation
		let item = new TreeItem(element.name);
		item.tooltip = element.tooltip;
		
		if(element.identifier == "fld_tools"){
			item.collapsibleState = TreeItemCollapsibleState.Expanded;
			item.image = "folder-color";
			item.contextValue = element.contextValue;
			return item;
		}else if(element.identifier == "cmd_reveal_tools"){
			item.image = "bolt";
			item.contextValue = element.contextValue;
			return item;
		}
		
		
		item.image = "tool";
		item.command = "expw_tools.doubleClick";
		item.contextValue = element.contextValue;
		
		return item;
	},
	getChildren(element) {
		// Requests the children of an element
		if (!element) {
			return this.getRootItems();
		}else if(element.identifier == "fld_tools"){
			return this.getToolsItems();
		}else {
			return element.children;
		}
	},
	getToolsItems: function(){
		var out = [];
		for([uid, tool] of this.tools.items){
			out.push(tool);
		}
		return out;
	},
	getRootItems: function(){
		var out = [];
		
		out.push( {
			name:"Tools",
			tooltip:"Tools...",
			identifier:"fld_tools",
			contextValue:'cmd_tools',

		});
		out.push( {
			name:"Open tools folder",
			tooltip:"Open tools folder...",
			identifier:"cmd_reveal_tools",
			contextValue:'cmd_reveal_tools',
		});
		return out;
	},
	
	toolRun: function(uid, hook, ctxData){
		
		console.log("[EXW-TOOLS] UID=%s", uid);
		if(!this.tools.items.has(uid)) return;
		var tool = this.tools.items.get(uid);
		
		if(!hook)  hook = 'onAction';
		
		console.log("[EXW-TOOLS] Running tool %s with hook %s", uid, hook);
		
		if(tool.hasOwnProperty(hook) && (typeof(tool[hook]) == 'function')){
			try{
				tool[hook]();
			}catch(err1){
				console.error("[EXW-TOOLS] Tool \"%s\" failed.", tool.__uid);
			}
		}
	},
	toolAdd: function(file){
		let tools = this.tools;
		
		const pathTool = file;
		const fileName = nova.path.basename(file);
		
		const ext = fileName.substr(fileName.lastIndexOf('.') + 1);
		if(ext != "js") return;
		
		var src = helper.readFile(pathTool);
		if(!src) return;
		
		
		var uid = replaceAll(replaceAll(fileName.replace('.js',''),' ','-'),'_','-').toLowerCase();
		if(tools.hasOwnProperty(uid)){
			let suid = uid;
			var i = 1;
			uid = suid + '-' + i.toString();
			while(tools.hasOwnProperty(uid)){
				i++;
				uid = suid + '-' + i.toString();
			}
		}
		
		//console.log("@toolAdd[%s]=%s",uid,  fileName); 
		
		var tool = null;
		src = "tool = null;\n" + src;
		try {
			eval(src);
		}catch(ex){
			console.error('EXW TOOL Error running script! [ERR500] in file "%s".', pathTool);
			return;
		}
		if(tool){
			let s = tool.name ? tool.name : uid;
			let tooltip = tool.tooltip ? tool.tooltip : null;
			
			var ideTool = {
				__uid: uid, __source_path: pathTool, __source_file: fileName,
				name:s,
				tooltip:tooltip,
				identifier:uid,
				children: [],
				contextValue:'tool',
			};
			
			if(tool.onAction && (typeof(tool.onAction) == 'function')){
				ideTool.onAction = function(){
					let path = nova.path;
					
					helper.file_path = null;
					helper.file_name = null;
					helper.file_extension = null;
					
					let editor = nova.workspace.activeTextEditor;
					if(editor && editor.document){
						helper.file_path = editor.document.path;
						helper.file_name = nova.path.basename(editor.document.path);
						helper.file_extension = nova.path.extname(editor.document.path);
					}
					
					tool.onAction();
				};
				
				
			}
			if(tool.onSave && (typeof(tool.onSave) == 'function')){
				ideTool.onSave = function(apath, editor){
					
					let path = nova.path;
					
					helper.file_path = apath;
					helper.file_name = null;
					helper.file_extension = null;
					
					if(apath){
						helper.file_name = nova.path.basename(apath);
						helper.file_extension = nova.path.extname(apath);
					}
					tool.onSave(apath, editor);
				};
				
				
			}
			
			
			if(!this.tools.items.has(uid)){
				this.toolInstall(uid);
			}
			
			tools.items.set(uid,ideTool);
		}
		
		
		
	},
	toolInstall: function(tool){
		if( tool.onSave ){
			tools.hooks.onSave.push(tool.__uid);
		}
	
		
	},
	loadTools: function(){
		const paths = nova.fs.listdir(this.pathScripts);
		for(var i=0; i<paths.length; i++){
			var file = paths[i];
			file = nova.path.join(this.pathScripts, file);
			
			//console.log("file=%s",file);
			const fst = nova.fs.stat(file);
			if(!fst || fst.isDirectory()) continue;
			this.toolAdd(file);
		}
		
	},
	installExtension: function(){
		
		nova.fs.mkdir(this.pathScripts);
		
		const pathTplScript = nova.path.join(nova.extension.path, 'assets', "template.js");
		nova.fs.copy(pathTplScript, nova.path.join(this.pathScripts, "MyTool.js"));
		
		
		
	},
	init: function(){
		
		this.disposables = new CompositeDisposable();
		
		const pStore = nova.extension.globalStoragePath;
		this.pathScripts = nova.path.join(pStore, 'tools');
		
		if (!nova.fs.access(this.pathScripts, nova.fs.F_OK)) {
	
			this.installExtension();
		}
		
		this.tools.items = new Map();
		
		this.loadTools();
		
		nova.commands.register("expw_tools.reload", () => {
			this.loadTools();
			this.treeView.reload();
		});
		
		nova.commands.register("expw_tools.add", () => {
			const pathTplScript = nova.path.join(nova.extension.path, 'assets', "template.js");
			
			nova.workspace.showInputPalette("Enter a name for the new tool", {value:"Untitled.js"}, (fname) => {
				if(!fname || fname.length == 0) return;
				
				const newFile = nova.path.join(this.pathScripts, fname);
				nova.fs.copy(pathTplScript, newFile);
				
				nova.workspace.openFile(newFile);
			});
		});
		
		nova.commands.register("expw_tools.doubleClick", () => {
			// Invoked when an item is double-clicked
			let selection = this.treeView.selection;
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.contextValue == "tool"){
				this.toolRun(e.__uid);
			}else if(e.contextValue == "cmd_reveal_tools"){
				const p = new Process("/usr/bin/open", {"shell":true, "args":["-R", this.pathScripts]});
				p.start();
			}
		});
		
		nova.commands.register("expw_tools.edit", () => {
			const pathTplScript = nova.path.join(nova.extension.path, 'assets');
			
			let selection = this.treeView.selection;
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.contextValue == "tool"){
				nova.workspace.openFile(e.__source_path);
			}
			
			
		});
		nova.commands.register("expw_tools.showInFinder", () => {
			const pathTplScript = nova.path.join(nova.extension.path, 'assets');
			
			let selection = this.treeView.selection;
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.contextValue == "tool"){
				const p = new Process("/usr/bin/open", {"shell":true, "args":["-R", e.__source_path]});
				p.start();
				//nova.fs.reveal(e.__source_path); //leaves finder in a weird states
			}
		});
		
		
		// Create the TreeView
		this.treeView = new TreeView("expw_tools", {
			dataProvider: this
		});
		
		this.treeView.onDidChangeSelection((selection) => {
			// console.log("New selection: " + selection.map((e) => e.name));
		});
		
		nova.subscriptions.add(this.treeView);
		
		this.disposables.add( nova.workspace.onDidAddTextEditor((aTextEditor)=>{
			if(!aTextEditor.document) return;
			
			var toolEdited = null;
			
			this.disposables.add( aTextEditor.onDidSave( (editor)=> {
				
				let path = editor.document.path;
				
				for([uid, tool] of this.tools.items){
					if(tool.__source_path == path){
						this.toolAdd(tool.__source_path);
					}else if(tool.onSave){
						tool.onSave(path, editor);
					}
				}
					
			}));
		}));
	
	
		console.log("@Done");
	},
	
};


