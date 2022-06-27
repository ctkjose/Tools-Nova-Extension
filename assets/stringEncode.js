
function encodeSimple(s, opSingleLine){
	let opTrimWhite = true;
	//console.log("opTrimWhite=" + opTrimWhite);
	if (!opSingleLine && !s.endsWith('\n')) {
		//s += '\n';
	}
	var out = '"' + s.replace(/"/g, '\\\"');
	if(!opSingleLine){
		out = out.replace(/\n/g, '\\n\' + \n"');
		out = out.replace(/" \+ \n"$/, '');
	}else{
		if(opTrimWhite){
			out = out.replace(/\n\s*/g, '\\n');
		}else{
			out = out.replace(/\n/g, '\\n');
		}
	}
	
	out += '"';
	
	return out;
}

tool = {
	id:"stringEncode",
	name: "String Encode",
	tooltip: "Creates a double quotes string from the current selection...",
	onAction: function(){
		let sin = editor.getSelectedText();
		let opSingleLine = (sin.indexOf("\n") >= 0 ) ? false: true;
		let s = encodeSimple(editor.getSelectedText(), opSingleLine);
		editor.insertText(s);
	},
};