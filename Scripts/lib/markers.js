/*
Jose L Cuevas
https://exponentialworks.com
*/

const { ide, editor } = require('./helper');

var controller = {
	plugin: null,
	rootEntry: null,
	items: null, 
	config: null,
	currFile: '',
	parseMarks:  function(def, txt){
		var lines = txt.split(/\r?\n|\r/);
		var s = '', line_idx=0, line_col=0;
		var items = [];
		
		for(var i = 0; i< lines.length; i++ ){
			s = lines[i];
			line_idx++;
			
			if(/^\s*$/.exec(s)) continue;
			
			for(let mdef of def.marks){
				//console.log("find RE %s", mdef.re);
				m = mdef.re.exec(s);
				if(!m) continue;
				//console.log(m);
				var item = {
					title:'',
					icon:'nst-icn-mark',
					point: {row: line_idx, column: line_col},
					attr: {class:[]},
					items:[],
					type:'marker-ln',
					symType: 'marker',
				};
				
				item.title = (m[1]) ? m[1] : m[0];
				if(mdef.hasOwnProperty('reIdx')){
					console.log("reIdx=%d", mdef.reIdx);
					if(mdef.reIdx == -1){
						item.title = m[m.length-1];
					}else if(typeof m[mdef.reIdx] === 'number'){
						item.title = m[mdef.reIdx];
					}
				}
				
				
				if(mdef.exclude){
					var flgExclude = false;
					for(var j in mdef.exclude){
						let re = mdef.exclude[j];
						if( re.test(item.title)){
							console.log("exclude matched %s %s", item.title, re.source);
							flgExclude = true;
							break;
						}
					}
					if(flgExclude) continue;
				}
				
				if(mdef.symType){
					item.symType = mdef.symType;
				}
				if(mdef.icon){
					item.icon = mdef.icon;
				}
				if(mdef.title){
					//console.log('setting title from %s to %s', item.title, def.title);
					item.title = mdef.title;
				}
				if(mdef.class){
					if(Array.isArray(mdef.class)){
						item.attr.class = item.attr.class.concat(mdef.class);
					}else if(typeof(mdef.class) == "string"){
						item.attr.class.push(mdef.class);
					}
				}
				if(mdef.attr){
					let keys = Object.keys(mdef.attr);
					for(let ak of keys ){
						if(ak=='class') continue;
						item.attr[ak] = mdef.attr[ak];
					}
				}
				
				if(def.factory){
					//factory(lineState, mark)
					def.factory.apply(this, item);
				}
				

				items.push(item);
			}
			
			
		}
		
		return items;
	},
	//#MARK THis here
	populateMarks: function(){
		var flgFileChanged = false;
		
		let editor = nova.workspace.activeTextEditor;
		if(!editor){
			this.items = new Map();
			this.plugin.folderReload(this.rootEntry);
			return;
		}else{
			let path = editor.document.path;
			if(path != this.currFile){
				console.log("path changed %s=%s",path, this.currFile);
				this.currFile = path;
				flgFileChanged = true;
				
			}
		}
		
		let syntax = (ide.editor.syntax || "").toLowerCase();
		//ide.showAlert("syntax=" + syntax);
		
		this.rootEntry.children = [];
		
		let kuid = ide.createID();
		this.items = new Map();
		
		var syntaxId = null;
		for(let k of Object.keys(this.config)){
			console.log('grammer(%s)=%s', k, syntax);
			if(k == syntax){
				syntaxId = k;
				break;
			}
		}
		console.log('parseMarks(%s)', syntaxId);
		if(!syntaxId){
			this.plugin.folderReload(this.rootEntry);
			return;
		}
		if(!this.config.hasOwnProperty(syntaxId)){
			console.log("EXW-IDE:Makers:Grammer not implemented [%s]", syntaxId);
			this.plugin.folderReload(this.rootEntry);
			return;
		}
		
		var items = this.parseMarks(this.config[syntaxId], ide.editor.text);
		
		
		let createItems = (parent, items, filter) => {

			let cuid = parent.uid + '/';
			var childCount = 0;
			for(let sym of items){
				var flgNoChilds = false;
				if(sym.ignore) continue;
				if(filter.text){
					flgNoChilds = true;
					if(sym.title.toLowerCase().indexOf(filter.text.toLowerCase()) < 0 ) continue;
				}
				
				childCount++;
				
				console.log("sym[%s][%s]", sym.title, sym.icon);
				var def = {
					type: "marker" ,
					uid: cuid + childCount,
					name: sym.title,
					tooltip: "Markers...",
					controller: this,
					
					icon: sym.icon,
					isFolder: false,
					isEditable: false,
					isActionable: true,
					
					symType: sym.symType,
					row: sym.point.row,
					
					editor: ide.editor.textEditor,
					
					children:[]
				};
				
				
		
		
				if(sym.parent){
					def.symParentType = sym.parent.symType;
					def.symParentCaption = sym.parent.title;
					def.symParentIcon = sym.parent.icon;
				}
		
				if(sym.attr) def.symAttr = sym.attr;
		
				if(!flgNoChilds && sym.items.length > 0){
					createItems(def, sym.items, filter);
				}
		
				def.isFolder = (def.children.length > 0);
				parent.children.push(def);
			}
			
		};
		
		
		createItems(this.rootEntry, items, {});
		
		this.plugin.folderReload(this.rootEntry);
		this.plugin.treeView.reload(this.rootEntry, {reveal: 1});
		if(flgFileChanged){
			
		}
		
	},
	loadConfig: function(){
		let path = nova.path.join(nova.extension.globalStoragePath, 'markers.js');
		
		const fst = nova.fs.stat(path);
		if(!fst || !fst.isFile()) return;
		
		var src = ide.readFile(path);
		if(!src) return;
	
		var config = [];	
		try{
			eval(src);
		}catch(err){
			ide.alert('Your "markers.js" is invalid or has syntax errors.');
			return;
		}
		
		if(!config) return;
		
		this.config = config;
	},
	onEdit: function(entry){
		
	},
	onDoubleClick: function(entry){
		if(!entry) return;
		
		let ide = this.plugin.ide;
		if(entry.type == "fld_makers"){
			this.populateMarks(ide.editor.textEditor);
		}
		if(entry.type == "marker"){
			if(entry.editor){
				entry.editor.moveToTop();
				entry.editor.moveDown(entry.row);
			}
		}
	},
	onReload: function(){
		
	},
	/* !jose  was here joe */
	onGetChildren: function(entry){
		var out = [];
		
		if(entry.children) return entry.children;
		
		return out;
	},
	onInstall: function(){
		
	},
	
	/* !jose  5 */
	onInit: function(plugin){
	
		this.plugin = plugin;
		this.items = new Map();
		
		let p = nova.path.join(nova.extension.globalStoragePath, 'markers.js');
		if (!nova.fs.access(p, nova.fs.F_OK)) {
			
			const pathSymConfig = nova.path.join(nova.extension.path, 'assets', "markers.js");
			nova.fs.copy(pathSymConfig, nova.path.join(nova.extension.globalStoragePath, "markers.js"));
		}
	
		this.loadConfig();
		
		this.rootEntry = {
			type: "fld_makers",
			uid: "fld_makers", 
			name: "Markers",
			tooltip: "Code markers...",
			controller: this,
			
			icon: "object",
			isFolder: true,
			isEditable: false, //can we show edit menu
			isActionable: true, //can we double click on it...
			
			children:[]
		};
		
		
		
		plugin.addRootItem( this.rootEntry );
		
		plugin.ide.on("doc-saved", (textEditor)=>{
			setTimeout(()=>{
				this.populateMarks(textEditor);
			}, 10);
		});
		
		
		plugin.ide.on("doc-focus", (textEditor)=>{
			this.populateMarks(textEditor);
		});
	
		
		plugin.ide.on("doc-syntax-changed", (textEditor)=>{
			this.populateMarks(textEditor);
		});
		
	}
};


exports.controller = controller;