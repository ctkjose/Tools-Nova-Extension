const { ide, editor } = require('./helper');

var controller = {
	pathPrj: "",
	plugin: null,
	commandsEntries: {},
	rootEntry: null,
	openTabsEntry: null,
	items: null, 
	
	skipFiles: ['.DS_Store', ".svn"],
	activeProject: null,
	activeProjectFolder: null,
	
	listOpenTabs: function(){
		var out = [];
		for(let textEditor of nova.workspace.textEditors){
			if(!textEditor.document) continue;
			
			var entry = null;
			if(textEditor.document.path){
				entry = this.entryForPath(textEditor.document.path);
				entry.editor = textEditor;
			}else{
				
			};
			
			if(entry){
				out.push(entry);
			}
		}
		
		out.sort((a, b) => {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			
			return a > b ? 1 : b > a ? -1 : 0;
		});

		return out;
	},
	entryForPath: function(path){
		//console.log("listing %s", path);
		
		const file = ide.getFileInfo(path);
		if(!file.exists) return null;
		
		//console.log("entryForPath(%s)", path);
		
		var entry = {
			type: "fs",
			uid: path, 
			name: file.name,
			tooltip: path,
			controller: this,
			
			icon: file.icon,
			isFolder: file.isDirectory,
			isEditable: file.isReadable,
			isActionable: true,
		
			path: path,
			file: file
		};
		
		if(file.isDirectory){
			entry.type = "fsd";
		}
		
		return entry;
	},
	listPath: function(path){
		
		var out = [];
		if(!path) return out;
		if(path.substring(-1, 1) != '/'){
			path += "/";
		}
		
		const paths = nova.fs.listdir(path);
		for(let p of paths){
			if(this.skipFiles.indexOf(p) >= 0) continue;
			
			p = nova.path.join(path, p);
			let e = this.entryForPath(p);
			if(!e) continue;
			out.push(e);
		}
		
		return out;
	},
	listProjectRoot: function(activeProject){

		var out = [];
		if(!activeProject) return out;

		for(let p of activeProject.paths){
			let e = this.entryForPath(p);
			if(!e) continue;
			out.push(e);
		}
		
		return out;
	},
	loadProjects: function(){
		let prjPath = nova.path.join(nova.extension.globalStoragePath, 'projects.js');
		
		const fst = nova.fs.stat(prjPath);
		if(!fst || !fst.isFile()) return;
		
		var src = ide.readFile(prjPath);
		if(!src) return;

		var sIn = [];	
		try{
			eval("sIn=" + src + ";");
		}catch(err){
			ide.alert('Your "projects.js" is corrupted.');
			return;
		}
		
		if(!sIn || !Array.isArray(sIn)) return;
		
		for(let e of sIn){
			e.controller = this;
			console.log("Loaded %s, %s", e.uid, e.name);
			this.items.set(e.uid, e);
		}
		
	},
	saveProjects: function(){
		
		let prjPath = nova.path.join(nova.extension.globalStoragePath, 'projects.js');
		
		const { objSerializer } = require('./helper');
		
		var obj = [];
		for([uid, entry] of this.items){
			obj.push(entry);
			//obj.items[uid] = Object.assign({}, entry);
			//delete obj.items[uid].controller;
		}
		
		var data = objSerializer(obj, {ignoreKeys: ["controller"]});
		console.log(data);
		ide.writeFile(prjPath, data);
		
	},
	activateProject: function(uid){
		
		this.activeProject = null;
		this.activeProjectFolder = null;
		
		if(!this.items.has(uid)) return;
		
		nova.workspace.config.set("expw_prj.prj.active", uid);
		
		this.activeProject = this.items.get(uid);
		this.activeProjectFolder = {
			type: "fld_act_project",
			uid: "fld_act_project", 
			name: this.activeProject.name,
			tooltip: "Project documents...",
			controller: this,
			
			icon: "folder-color",
			isFolder: true,
			isEditable: true, //can we show edit menu
			isActionable: false, //can we double click on it...
			
			project: uid,
		};
			
		this.plugin.folderReload(this.rootEntry);
		console.log("activated %s", uid);
	},
	createProject: function(name){
		var uid = ide.createID();
		
		var entry = {
			type: "prj",
			uid: uid, 
			name: name,
			tooltip: "Open project",
			controller: this,
			
			icon: "folder-color",
			isFolder: false,
			isEditable: false,
			isActionable: false,
			
			
			paths: [],
			tools: {},
		};
		
		this.items.set(entry.uid, entry);
		
		this.saveProjects();
		//this.plugin.folderReload(this.rootEntry);
		
		console.log("Created project");
		
		return entry;
	},
	openProject: function(){
		
		let choices = [];
		for([uid, entry] of this.items){
			choices.push(entry.name);
		}
		
		nova.workspace.showChoicePalette(choices, {placeholder:"Select a project..."}, (name) => {
			if(!name || name.length == 0) return;
			for([uid, entry] of this.items){
				if(entry.name == name){
					this.activateProject(entry.uid);
					return;
				}
			}
		});
	},
	newProject: function(){
		
		nova.workspace.showInputPalette("Enter a name for the new project", {value:"My Project"}, (name) => {
			if(!name || name.length == 0) return;
			
			const entry = this.createProject(name);
			this.activateProject(entry.uid);
		});
	},
	addProjectPath: function(path){
		
		if(!this.activeProject) return;
		
		var selectedPaths = [];
		
		let onDone = ()=>{
			if(!selectedPaths) return;
			
			for(let p of selectedPaths){
				console.log("path %s", p);
				const fst = nova.fs.stat(p);
				if(!fst || !fst.isDirectory()) return;
			
				if( this.activeProject.paths.indexOf(p) >= 0 ) continue;
				
				this.activeProject.paths.push(p);
			}
			
			this.saveProjects();
			this.plugin.folderReload(this.rootEntry);
		};
		if(!path){
			nova.workspace.showFileChooser("Select a folder to add to this project.", {prompt:"Choose", allowFiles:false, allowFolders: true, allowMultiple:true}, (paths) => {
				if(!paths || paths.length==0) return;
				selectedPaths = paths;
				
				onDone();
			});
		}else{
			selectedPaths = [path];
			onDone();
		}
		
		
		
		
		
	},
	onEdit: function(entry){
		
	},
	onDoubleClick: function(entry){
		if(!entry) return;
		
		if(entry.type == "fs"){
			if(entry.editor){
				
				//entry.editor.scrollToCursorPosition();
				nova.workspace.openFile(entry.path);
			}else if(entry.path){
				nova.workspace.openFile(entry.path);
			}
		}else if(entry.uid == "cmd_add_prj"){
			this.newProject();
		}else if(entry.uid == "cmd_prj_add_path"){
			this.addProjectPath();
		}else if(entry.uid == "cmd_open_prj"){
			this.openProject();
		}
	},
	onReload: function(){
		
	},
	onGetChildren: function(entry){
		var out = [];
		
		if( entry.uid == "fld_projects"){
			let actPrjUid = nova.workspace.config.get("expw_prj.prj.active");
			
			//out.push(this.openTabsEntry);
			
			for(let uid of Object.keys(this.commandsEntries)){
				out.push(this.commandsEntries[uid]);
			}
			
			if( this.activeProject ){
				
				let addPathEntry = {
					type: "cmd",
					uid: "cmd_prj_add_path", 
					name: "Add path...",
					tooltip: "Add a path to the active project...",
					controller: this,
					
					icon: "bolt",
					isFolder: false,
					isEditable: false,
					isActionable: true,
				};
				out.push(addPathEntry);
				
				out.push(this.activeProjectFolder);
			}else if(actPrjUid){
				this.activateProject(actPrjUid);
			}
			
			return out;
		}else if( entry.uid == "fld_opentabs"){
			return this.listOpenTabs(entry);
		}
		
		if( entry.type == "fsd"){
			return this.listPath(entry.path);
		}else if( entry.uid == "fld_act_project"){
			if(!this.activeProject) return out;
			return this.listProjectRoot(this.activeProject);
		}
		
		
		
		
		return out;
	},
	onInstall: function(){
		
	},
	onInit: function(plugin){
	
		this.plugin = plugin;
		
		/*this.pathPrj = nova.path.join(nova.extension.globalStoragePath, 'projects');
		if (!nova.fs.access(this.pathPrj, nova.fs.F_OK)) {
			nova.fs.mkdir(this.pathPrj);
		}
		*/
		
		this.items = new Map();
		this.loadProjects();
		
		
		
		this.rootEntry = {
			type: "fld_projects",
			uid: "fld_projects", 
			name: "Project",
			tooltip: "Project...",
			controller: this,
			
			icon: "project",
			isFolder: true,
			isEditable: false, //can we show edit menu
			isActionable: false, //can we double click on it...
		};
		
		
		
		
		this.openTabsEntry = {
			type: "fld_opentabs",
			uid: "fld_opentabs", 
			name: "Open Tabs",
			tooltip: "Open tabs...",
			controller: this,
			
			icon: "folder-color",
			isFolder: true,
			isEditable: false,
			isActionable: true,
		};
		
		
		plugin.addRootItem( this.openTabsEntry );
		plugin.addRootItem( this.rootEntry );
		
		//this.commandsEntries[ openTabsEntry.uid ] = openTabsEntry;
		
		nova.commands.register("expw_prj.addPathToProject", () => {
			if( !this.activeProject ) return;
			this.addProjectPath();
		});
		
		nova.commands.register("expw_prj.openProject", () => {
			this.openProject();
		});
		
		nova.commands.register("expw_prj.newProject", () => {
			this.newProject();
		});
		
		plugin.ide.on("'doc-added", (textEditor)=>{
			plugin.folderReload(this.openTabsEntry);
		});
		plugin.ide.on("doc-destroyed", (textEditor)=>{
			plugin.folderReload(this.openTabsEntry);
		});
		
	}
}


exports.controller = controller;