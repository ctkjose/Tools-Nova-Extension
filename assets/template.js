tool = {
	id:"hellotool",
	name: "Hello World",
	/* A tool object implements hooks */
	onAction: function(){
		//onAction Hook
		//Executed when the tool is double clicked or invoked by a menu...
		nova.workspace.showInformativeMessage("Hello World");
	},
	onSave: function(path, editor){
		//onSave Hook
		//Executed when a file is saved...
		
		
	}
};