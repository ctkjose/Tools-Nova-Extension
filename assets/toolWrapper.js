loadTool = function (ide, editor){
	//Fake a sandbox and context
	const __filename = "%FILENAME%";
	
	var tool = null;
	try {
		%CODE%
	}catch(ex){
		console.error('[ERR500] Error running script file "%s".', __filename);
		return null;
	}
	
	return tool;
}