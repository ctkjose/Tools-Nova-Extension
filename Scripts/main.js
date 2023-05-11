
var treeView = null;

//#MARK Jose
String.prototype.replaceAll = function(search, replace) {
	var string = this.toString(this);
 	return string.split(search).join(replace);
}

//const helper = require('./lib/helper'); 
//const ide = helper.ide;
const { ide } = require('./lib/helper');


/* !test jose26 */
exports.activate = function() {
    // Do work when the extension is activated
    
	plugin.init();
}

exports.deactivate = function() {
   ide.dispose();
}

/*
Object.defineProperty(global, '__file', {
  get: function(){
	return "jose";
  }
});
*/


var pStore = nova.extension.globalStoragePath;
//nova.workspace.showInformativeMessage("alive=" + pStore);
var plugin = {
	rootItems: [],

	tree:null,
	disposables:null,
	_editingTool:null,
	
	markersController:null,
	scriptsController:null,
	prjController:null,
	
	getTreeItem(entry) {
		// Converts an element into its display (TreeItem) representation
		let item = new TreeItem(entry.name);
		
		item.identifier = entry.uid;
		item.contextValue = entry.type;
		
		if(entry.tooltip){
			item.tooltip = entry.tooltip;
		}
		if(entry.icon){
			item.image = entry.icon;
		}
		if(entry.hasOwnProperty("path") && entry.path){
			item.path = entry.path;
		}
		
		if( entry.isFolder ){
			
			var folderState = TreeItemCollapsibleState.Collapsed;
			
			if(entry.hasOwnProperty("folderState")){
				folderState = entry.folderState;
			}else{
				entry.folderState = folderState;
			}
			
			item.collapsibleState = folderState;
		}
		if(entry.isActionable){
			item.command = "expw_prj.doubleClick";
		}
		
		return item;
	},
	getChildren(entry) {
		// Requests the children of an element
		if (!entry) {
			return this.rootItems;
		}else{
			if( entry.isFolder && entry.controller ){
				return entry.controller.onGetChildren(entry);
			}
		}
		
		return [];
	},
	installExtension: function(){
		
		nova.fs.mkdir(this.pathScripts);
		
		const pathTplScript = nova.path.join(nova.extension.path, 'assets', "template.js");
		nova.fs.copy(pathTplScript, nova.path.join(this.pathScripts, "MyTool.js"));
		
		
		
	},
	addRootItem: function(entry){
		this.rootItems.push(entry);
	},
	folderReload: function(entry){
		if(!this.treeView) return;
		if(entry){
			this.treeView.reload(entry);
		}else{
			this.treeView.reload();
		}
	},
	treeSelection: function(){
		if(!this.treeView) return null;
		return this.treeView.selection;
	},
	cmdNewFile: function(path){
		nova.workspace.showInputPalette("Enter file name", {value:"file.php"}, (name) => {
			if(!name || name.length == 0) return;
			const newFile = nova.path.join(path, name);
			const fst = nova.fs.stat(newFile);
			if(fst){
				ide.showAlert('A file named "' + name + '" already exists at this location.');
				return;
			}
			
			ide.writeFile(newFile, "");
			
			nova.workspace.openFile(newFile);
		});
	},
	init: function(){
	
		console.log("tools.init");
		
		ide.init(); //helper to interact with Nova
		
		this.ide = ide;
		
		this.initScripts();
		this.initProjects();
		this.initMarkers();
		
		// Create the TreeView
		this.treeView = new TreeView("expw_prj", {
			dataProvider: this
		});
		
		this.treeView.onDidChangeSelection((selection) => {
			// console.log("New selection: " + selection.map((e) => e.name));
		});
		
		nova.subscriptions.add(this.treeView);
		
		nova.commands.register("expw_prj.refreshmarkers", () => {
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			this.markersController.populateMarks(ide.editor.textEditor);
		});
		nova.commands.register("expw_prj.add", () => {
			
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			if(e.uid == "fld_projects"){
				this.prjController.newProject();
			}else if(e.type == "fsd"){
				if(!e.hasOwnProperty("path") || !e.path) return;
				
				this.cmdNewFile(e.path);
			}else if(e.uid == "fld_act_project"){
				this.prjController.addProjectPath();
			}else if(e.uid == "fld_tools"){
				this.scriptsController.newScript();
				
			}
		
		});
		nova.commands.register("expw_prj.reload", () => {
			
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			if(e.uid == "fld_projects"){
				
				this.folderReload(e);
			}else if(e.type == "fsd"){
				if(!e.hasOwnProperty("path") || !e.path) return;
				this.folderReload(e);
			}else if(e.uid == "fld_act_project"){
				this.folderReload(e);
			}else if(e.uid == "fld_makers"){
				this.markersController.populateMarks();
				this.folderReload(e);
			}else if(e.uid == "fld_tools"){
				this.scriptsController.onReload();
				
				this.folderReload(e);
			}
			
		});
		
		nova.commands.register("expw_prj.doubleClick", () => {
			// Invoked when an item is double-clicked
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.controller){
				e.controller.onDoubleClick(e);
			}
		
		});
		
		nova.commands.register("expw_prj.edit", () => {
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.hasOwnProperty("path") && e.path){
				nova.workspace.openFile(e.path);
			}
		});
		
		nova.commands.register("expw_prj.copyPath", () => {
			
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.hasOwnProperty("path") && e.path){
				nova.clipboard.writeText(e.path);
			}
		});
		nova.commands.register("expw_prj.showInFinder", () => {
			
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			
			if(e.hasOwnProperty("path") && e.path){
				ide.revealInFinder(e.path);
				//nova.fs.reveal(e.__source_path); //leaves finder in a weird states
			}
		});
		
		nova.commands.register("expw_prj.newFile", () => {
			
			let selection = this.treeSelection();
			if(!selection || selection.length == 0) return;
			
			const e = selection[0];
			if(e.type != "fsd" || !e.hasOwnProperty("path") || !e.path) return;
			
			this.cmdNewFile(e.path);
			
			
		});
		
		
		console.log("@Done");
	},
	initMarkers: function(){
		const { controller } = require('./lib/markers.js');
		this.markersController = controller;
		controller.onInit(this);
	},
	initProjects: function(){
		const { controller } = require('./lib/projects.js');
		this.prjController = controller;
		controller.onInit(this);
		
	},
	initScripts: function(){
		
		const { controller } = require('./lib/scripts.js');
		this.scriptsController = controller;
		//controller.pathScripts =  nova.path.join(nova.extension.globalStoragePath, 'tools') );
		
		
		//if (!nova.fs.access(this.pathScripts, nova.fs.F_OK)) {
		//	this.installExtension();
		//}
		
		controller.onInit(this);	
		
		
	
		
	},
	
};


