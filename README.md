# Tools #

**Tools** adds a repository of quick commands to automate tasks. Similar to Nova's Tasks but in **Tools** you can create simple js scripts and have them handy in a Sidebar. Tools are not associated to a workspace/project like tasks, nor are they tied to a build-run cycle, they are simple scripts that you can run as needed.

Tools are vanilla js scripts that are saved in the folder `~/Library/Application Support/Nova/Extensions/EXPW.Tools/tools/`.

# Usage #

This extensions add a new sidebar that you can access from the sidebar panel in Nova. The sidebar will list all the tools that you create or install. A tool is a vanilla js script that you can use to automate tasks in Nova. The sidebar will show a basic set of icons on its tool bar to add, edit and refresh your tools.

## Create a Tool ##

To create a tool press the plus icon on the Tools's sidebar. This will open a new js document in Nova with the template code of a tool skeleton.

You can also edit the contents of the folder `~/Library/Application Support/Nova/Extensions/EXPW.Tools/tools/` and add your own js file manually.

> If you get a tool script from somebody else, check the source code and only install scripts you obtained from a trusted source.

Use the refresh button on the sidebar to reload the tools from the file system.

## Edit a Tool ##

Select a tool and press the pencil icon on the sidebar to edit your tool. When you save your tool the changes are automatically reloaded.

## Running a Tool ##

Double click a tool to run it.

## Anatomy of a Tool ##

A tool is a vanilla js object with some required properties and functions.

The basic structure of a tool is:
```JS
tool = {
id:"hellotool",
name: "Hello World",

//... we add hooks here
}
```

The following properties are available in the tool object:

| Key | Description |
| --- | --- |
| id | String, A unique identifier for your tool. |
| name | String, A human readable name for the tool. |
| onAction | Function, A hook that will be executed when the user double clicks on the tool or it is executed from a menu.<br><br>Parameters: none. |
| onSave | Function, A hook that will be executed when the user saves a document in Nova.<br><br>Parameter:<br>`path` String with the file path.<br>`editor` Instance of the [TextEditor](https://docs.nova.app/api-reference/text-editor/). |


## Writing a tool script ##

Basic tools are invoked when the user double clicks the tool on the sidebar. This type of tool implements the `onAction` hook.

The `onAction` hook is a property of our tool object whose value is a function. Inside our function we write our code.

When automating a task you may optionally implement the `onSave` hook. This function will be called automatically whenever Nova saves a document. This functions takes two arguments a string with the `path` of the file and the `editor` with the instance of the [TextEditor](https://docs.nova.app/api-reference/text-editor/).

In your code you have access to Nova's [API](https://docs.nova.app/api-reference) in addition we provide a simple helper with common tasks.

### Helper ###

`helper.file_path`

String with the absolute path of the active editor or file in scope.

`helper.file_name`

String with the file name of the active editor or file in scope.

`helper.file_extension`

String with the file extension of the active editor or file in scope.


`helper.revealInFinder( aPath )`

Reveals the file or folder given in `aPath`.

`helper.readFile( aPath )`

Returns a string with the contents of a file given in the absolute path `aPath` or `null` if unable to read the file.

`helper.isPathOpen(aPath, workspace)`

Returns true if the absolute path in `aPath` is currently open in Nova.

`helper.editor`

This is a proxy object with some functionality to interact with the active editor.

`helper.editor.path`

String property with the path to the document open on the editor.

`helper.editor.filename`

String property with the file name of the document open on the editor.

`helper.editor.directory`

String property with the directory of the document open on the editor.

`helper.editor.textEditor`

The instance of the active [TextEditor](https://docs.nova.app/api-reference/text-editor/).


`helper.editor.getSelectedText()`

Function that returns the text selected.

`helper.editor.insertText(text)`

Insert the string given in `text` in the current insertion point. If the editor had a selection it will be replaced.

`helper.editor.insertSnippet(text)`

Insert the string given in `text` in the current insertion point as a [snippet](https://docs.nova.app/extensions/snippets/). If the editor had a selection it will be replaced.

`helper.editor.save()`

Save the text editor contents. 

`helper.process(cmd, args)`

Creates a process in a shell for the `command` with the arguments in the array `args` (string array).

The process is an event emitter with the following events:

| Event | Description |
| --- | --- |
| `close` | The `close` event is emitted after a process has ended and the stdio streams of a child process have been closed. Arguments:<br>`code` number The exit code if the child exited on its own. |
| `error` | The `error` event is emitted whenever an error occurred. Arguments:<br>`code` number The exit code if the child exited on its own. |
| `data` | The 'data' event is emitted whenever data from StdOut is available. Arguments:<br>`data` string. |
| `stderr` | The `stderr` event is emitted whenever data from StdErr is available. Arguments:<br>`data` string. |
 
Methods:

| Method | Description |
| --- | --- |
| `subprocess.run()` | Executes the process asynchronously. Returns a promise. |
| `subprocess.kill([signal])` | The subprocess.kill() method sends a signal to the child process. If no argument is given, the process will be sent the 'SIGKILL' signal. Available signals are 'SIGINT', 'SIGTERM', or 'SIGHUP'. |
| `subprocess.terminate()` | Helper method to kill process with a 'SIGTERM' signal. |
| `subprocess.write(inData)` | Writes the contents of the string given by `inData` to StdIn. |


Properties:

| Method | Description |
| --- | --- |
| `pid` | Readonly The process PID. |
| `cwd` | The current working directory. Can be set anytime before you call `run()`. |
| `shell` | If `true` then `/bin/sh` is used, else set to a string with the path to the desired shell. Can be set anytime before you call `run()`. |
| `results` | String. The output of the command received in StdOut. |
| `stdErr` | String. The output of the command received in StdErr. |
| `exitCode` | Numeric. The exit code of the child process. |

Example 1:

```js
//use async/await to wait for process to run...
onSave: async function(path, editor){
	const p = helper.process("ls", ["-la", path]);
	await p.run();
	console.log("out=%s", p.results);
}
```

Example 2:
```js
onSave: function(path, editor){
	console.log("Saving files 2 %s", path);
	
	const p = helper.process("ls", ["-la", path]);
	p.on("data", (data)=>{
		console.log("my data=%s", data);
	})
	
	p.on("close", (status)=>{
		console.log("Command done");
		console.log("out=%s", p.results);
	});
	
	p.run();
}
```

```js
//use promise...
onSave: function(path, editor){
	const p = helper.process("ls", ["-la", path]);
	p.run().then((data)=>{
		console.log("out=%s", data);
	});
}
```


###

### Notes ###

1. Use Nova's [path](https://docs.nova.app/api-reference/path/) object to manipulate paths. For example:
```js
onAction:function(){
	let filePath = nova.path.join(path1, dirName, "file.js");
}
```

2. To get the active [editor](https://docs.nova.app/api-reference/text-editor/):

```js
onAction:function(){
	let editor = nova.workspace.activeTextEditor;
	if(!editor) return;
}
```

3. Check Nova's [process](https://docs.nova.app/api-reference/process/) object for more options running shell commands.


## Requirements

Tools is a vanilla extension and does not require any additional software. 


