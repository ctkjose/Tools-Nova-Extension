/*
Jose L Cuevas
https://exponentialworks.com
*/

const { ide, editor } = require('./helper');

var exwSymbolParser = {
	grammers: {},
	grammer: null,
	state: null,
	addGrammer: function(grammerId, grammer){

		let cfgRequired = [
			{k:'t',v:'marker-ln'}, {k:'block',v:false}, {k:'symType',v:'marker'}
		];

		let sanitize = (items) => {
			for(let e of items){
				if(e.p){
					e.re = this.getRegEx(grammer, e);
				}
				for(let fld of cfgRequired){
					if(!e.hasOwnProperty(fld.k)){
						e[fld.k] = fld.v;
					}
				}
			}
		};

		if(!grammer.regexExpansions) grammer.regexExpansions = [];

		if(grammer.symbols) sanitize(grammer.symbols);
		if(grammer.pragma) sanitize(grammer.pragma);

		//if(!grammer.preflight) grammer.preflight = function(s){ return s; };

		this.grammers[grammerId] = grammer;
	},
	getRegEx: function(grammer, def){

		if(def.re){
			return def.re;
		}

		var s = def.p;
		//comment here
		for(var i in grammer.regexExpansions){
			var e = grammer.regexExpansions[i];
			s = s.replace(e['m'], e['p']);
		}


		//console.log("RegEx: %s", s);
		return new RegExp('^\\s*' + s);
	},
	parse: function(grammerId, src){

		if(!this.grammers.hasOwnProperty(grammerId)){
			console.log("EXW-IDE:SymbolParser:Grammer not implemented [%s]", grammerId)
			return null;
		}

		var state = {
			line_idx: -1,
			position: -1,
			grammer: this.grammers[grammerId],
			lines: [],
			marks: [],
			items:[],
			depth: 0,
		};

		state.lines = src.split(/\r?\n|\r/);


		var id=0, lastScope=0, lc=0, is_pragma=false;
		var s = ""; openBlocks=0, closeBlocks=0, eof=false;
		var e;

		var nesting = {
			level: 0, last: 0, opened: 0, closed: 0, delta: 0,
			dump: function(s){
				console.log('%sNEXTING: LEVEL=%d PREVIOUS=%d OPENED=%d CLOSED=%d CHANGE=%d',s, this.level,this.last,this.opened,this.closed,this.delta );
			},
			current: null,
			push: (item) => {
				item.parent = nesting.current;
				item.depth = nesting.last;
				if(nesting.current){
					nesting.current.items.push(item);
				}else{
					state.items.push(item);
				}
			},
			open: (item) => {
				item.parent = nesting.current;
				item.depth = nesting.last;

				if(nesting.current){
					nesting.current.items.push(item);
				}else{
					state.items.push(item);
				}

				nesting.current = item;
				//console.log("OPENED[%d] %s", item.depth, item.title);
			},
			close: () => {
				if(!nesting.current) return;
				let item = nesting.current;
				if(item.parent){
					nesting.current = item.parent;
				}else{
					nesting.current = null;
				}

				//console.log("CLOSED[%d] %s", item.depth, item.title);
			}
		};

		var computeNexting = (s) => {
			nesting.last = nesting.level;
			let o = [...s.matchAll(/\{/g)];
			let c = [...s.matchAll(/\}/g)];
			nesting.opened = ( o ) ? o.length : 0;
			nesting.closed = (c) ? c.length : 0;
			nesting.delta = nesting.opened - nesting.closed;
			nesting.level += nesting.delta;
		};

		var findMark = (e, marks) => {
			var def, r, re, m, i, reIdx;

			var item = {
				title:'',
				icon:'nst-icn-mark',
				point: {row: state.line_idx, column: state.position},
				attr: {class:[]},
				items:[],
				type:'marker-ln',
				symType: 'marker',
			};

			//console.log("LN[%d][%s]", item.row, e.text);
			e.item = null;
			for(var i in marks){
				def = marks[i];

				m = def.re.exec(e.text);
				if(!m) continue;

				item.title = (m[1]) ? m[1] : m[0];
				if(def.hasOwnProperty('reIdx')){
					//console.log("reIdx=%d", def.reIdx);
					if(def.reIdx == -1){
						item.title = m[m.length-1];
					}else if(typeof m[def.reIdx] === 'undefined'){
						item.title = m[def.reIdx];
					}
				}


				if(def.exclude){
					for(var j in def.exclude){
						let re = def.exclude[j];
						if( re.test(item.title)){
							//console.log("exclude matched %s %s", item.title, re.source);
							m = undefined;
							break;
						}
					}
					if(!m) continue;
				}


				e.def = def;
				e.isBlock = def.block;
				e.type = def.type;

				if(def.symType){
					item.symType = def.symType;
				}
				if(def.icon){
					item.icon = def.icon;
				}
				if(def.title){
					//console.log('setting title from %s to %s', item.title, def.title);
					item.title = def.title;
				}
				if(def.class){
					if(Array.isArray(def.class)){
						item.attr.class = item.attr.class.concat(def.class);
					}else if(typeof(def.class) == "string"){
						item.attr.class.push(def.class);
					}
				}
				if(def.attr){
					let keys = Object.keys(def.attr);
					for(let ak of keys ){
						if(ak=='class') continue;
						item.attr[ak] = def.attr[ak];
					}
				}

				if(state.grammer.factory){
					//factory(lineState, mark)
					state.grammer.factory.apply(this, [e, item]);
				}

				if(def.when){
					parent = (nesting.current || {title: root, symType: 'root', attr:[], icon:'', items:[]});
					if(!def.when(item, parent)) continue;
				}

				e.item = item;
				break;
			}
		};

		do{
			s = this.nextLine(state);
			if(!s) break;

			id = false;

			var e = {line: state.line_idx, text:s, is_pragma:false, isBlock: false, type:'', def:null };
			var flgIsPragma = null;
			
			if(state.grammer.pragma){
				for(let pEntry of state.grammer.pragma){
					m = pEntry.re.exec(s);
					if(m){
						flgIsPragma = pEntry;
						break;
					} 
				}
				
				if(flgIsPragma){
					findMark(e, [flgIsPragma]);
					
					if(e.item){
						nesting.push(e.item);
					}
					continue;
				}
				
			}
			
			if(state.grammer.comments.single_line && s.match(state.grammer.comments.single_line)){
				continue;
			}else{
				findMark(e, state.grammer.symbols);
			}

			computeNexting(s);

			//console.log("[%d] %s", state.line_idx, s);
			//nesting.dump('[' + state.line_idx + '] ');

			if(!e.item){
				if(nesting.delta == 0) continue;

				if(nesting.delta < 0 && nesting.current){ //
					var sc = nesting.last;
					for(var i = nesting.delta; i < 0; i++){
						if(--sc == nesting.current.depth){
							//console.log("[%d] closing scope=%d",state.line_idx, sc);
							nesting.close();
						}
					}
				}
				continue;
			}



			if(e.isBlock & nesting.delta!=0){
				//console.log("[%d] openScope scope=%d", state.line_idx, lastScope);
				nesting.open(e.item);
			}else{
				nesting.push(e.item);
			}

		}while(state.line_idx < state.lines.length);

		return state;
	},

	nextLine: function(state){
		var s = "";

		var skipEmptyLines = () => {
			do{
				state.line_idx++;
				if(state.line_idx >= state.lines.length){
					return false;
				}
				state.position += state.lines[state.line_idx].length + 1;
				//console.log('line[%d]=%s', state.line_idx, state.lines[state.line_idx])
				s = state.lines[state.line_idx];
				if(/^\s*$/.exec(s)) continue;

				break;
			}while(state.line_idx < state.lines.length);
			//console.log("[%d] getNextLine1=[%s]", state.line_idx, s);
		};

		skipEmptyLines();

		var cmsl;
		if(state.grammer.comments.single_line){
			cmsl = s.match(state.grammer.comments.single_line);
			
			if(cmsl){
				var flgIsPragma = false;
				for(let pEntry of state.grammer.pragma){
					m = pEntry.re.exec(s);
					if(m){
						flgIsPragma = true;
						break;
					} 
				}
				if(!flgIsPragma){
					s = s.replace(cmsl[0], '//...');
					return s;
				}else{
					//console.log("[%d] getNextLine4=[%s]", state.line_idx, s);
					return s;
				}
				
			}
		}

		s = s.replace(/\\'/g, String.fromCharCode(0))
			.replace(/\\"/g, String.fromCharCode(1))
			.replace(/\\\//g, String.fromCharCode(2)); // strip escapes

		s = s.replace(/".*?"/g, '"..."').replace(/'.*?'/g, "'...'");
		s = s.replace(/\/.+?\//g, '/.../');


		s = s.replace(/^\s+/, '');
		if(state.grammer.scope_glue){
			var glue, i,currs=s, save_state, glued=false;
			save_state = {l:state.line_idx, p: state.position};
			skipEmptyLines();
			for(i in state.grammer.scope_glue){
				glue = state.grammer.scope_glue[i];
				if(glue.when.exec(currs)){
					console.log("glue candidate line [%s]", s);
					if(glue.need.exec(s)){
						glued = true;
						console.log("Glueing [%s]", s);
						s = currs + s.replace(/^\s+/, '');
						break;
					}
				}
			}
			if(!glued){
				s = currs;
				state.line_idx = save_state.l;
				state.position = save_state.p;
			}
		}

		if(cmsl){ //replace single line comments
			//s = s.replace(/\u0005/g, cmsl);
		}




		if(state.grammer.preflight){
			s = state.grammer.preflight(s);
		}

		//console.log("[%d] getNextLine4=[%s]", state.line_idx, s);
		return s;
	}


};

exports.symbolParser = exwSymbolParser;




var controller = {
	plugin: null,
	rootEntry: null,
	items: null, 

	parser: exwSymbolParser,
	
	populateSymbols: function(){
		let syntax = (ide.editor.syntax || "").toLowerCase();
		//ide.showAlert("syntax=" + syntax);
		
		this.rootEntry.children = [];
		
		let kuid = ide.createID();
		this.items = new Map();
		
		var syntaxId = null;
		for(let k of Object.keys(this.parser.grammers)){
			if(k == syntax){
				syntaxId = k;
				break;
			}
		}
		
		if(!syntaxId){
			this.plugin.folderReload(this.rootEntry);
			return;
		}
		
		var state = this.parser.parse(syntaxId, ide.editor.text);
		
		
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
				
				//console.log("sym[%s][%s]", sym.title, sym.icon);
				var def = {
					type: "sym" ,
					uid: cuid + childCount,
					name: sym.title,
					tooltip: "File symbol...",
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
		
		
		createItems(this.rootEntry, state.items, {});
		
		this.plugin.folderReload(this.rootEntry);
	},
	loadSymbolsConfig: function(){
		let path = nova.path.join(nova.extension.globalStoragePath, 'symbols.js');
		
		const fst = nova.fs.stat(path);
		if(!fst || !fst.isFile()) return;
		
		var src = ide.readFile(path);
		if(!src) return;
	
		var config = [];	
		try{
			eval(src);
		}catch(err){
			ide.alert('Your "symnbols.js" is corrupted.');
			return;
		}
		
		if(!config) return;
		
		let keys = Object.keys(config);
		for( let syntaxId of keys){
			this.parser.addGrammer(syntaxId, config[syntaxId]);
		}
	
	},
	onEdit: function(entry){
		
	},
	onDoubleClick: function(entry){
		if(!entry) return;
		
		let ide = this.plugin.ide;
		if(entry.type == "fld_symbols"){
			this.populateSymbols(ide.editor.textEditor);
		}
		if(entry.type == "sym"){
			if(entry.editor){
				entry.editor.moveToTop();
				entry.editor.moveDown(entry.row);
			}
		}
	},
	onReload: function(){
		
	},
	onGetChildren: function(entry){
		var out = [];
		
		if(entry.children) return entry.children;
		
		return out;
	},
	onInstall: function(){
		
	},
	
	
	onInit: function(plugin){
	
		this.plugin = plugin;
		this.parser = exwSymbolParser;
		
		this.items = new Map();
		
		let p = nova.path.join(nova.extension.globalStoragePath, 'symbols.js');
		if (!nova.fs.access(p, nova.fs.F_OK)) {
			
			const pathSymConfig = nova.path.join(nova.extension.path, 'assets', "symbols.js");
			nova.fs.copy(pathSymConfig, nova.path.join(nova.extension.globalStoragePath, "symbols.js"));
		}
		
		
		this.loadSymbolsConfig();
		
		this.rootEntry = {
			type: "fld_symbols",
			uid: "fld_symbols", 
			name: "Code",
			tooltip: "Code browser...",
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
				this.populateSymbols(textEditor);
			}, 10);
			
		});
		
		
		plugin.ide.on("doc-focus", (textEditor)=>{
			this.populateSymbols(textEditor);	
		});
	
		
		plugin.ide.on("doc-syntax-changed", (textEditor)=>{
			this.populateSymbols(textEditor);
		});
		
	}
};


exports.controller = controller;