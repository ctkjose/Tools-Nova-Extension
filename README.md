# Tools #

This extension adds a sidebar to the [Nova](https://panic.com/nova) editor with a couple of Tools to help you make your day better!. 

## Tasks ##
Create your own repository of quick commands in vanilla js to automate tasks. Tasks are not associated to a workspace/project like Nova's tasks, nor are they tied to a build-run cycle, they are simple scripts that you can run as needed or even trigger them when a document is saved.

**Warning**: Use of Async/Await in tasks will cause Nova to become unstable and hang.

## Project ##

Allows you to group different folders into a named project. You can quickly open one of your named groups and browse the contents of your group right from the same Sidebar.

To create a project simply right click on the *Project* folder and select "New Project..." from the context menu. Use "Open Project..." to activate the project. Use "Add path to project..." to add a folder(s) to your project. When you select the **Project** folder you can also use the "Add" button to create a project.

## Open Tabs ##
When your tabs are out of control (always!) we added a "Open Tabs" folder that shows the tabs that are currently open...

## Markers ##

Mark sections of your code with special comments and quickly access these markers from the panel with just one click. 

Markers can be created using pragma like comments and using Nova's bookmark comments.

```js
//#MARK My factories 
//#TODO Refactor save code!
/* !Class Methods */
```


# This project is free! # 

Yeap is free, but if you feel grateful please consider helping with one of these: 

Donate to our local non-profit [Rescate de Playas Punta Borinquen](https://rescateplayasborinquen.org) a great cause conserving and protecting costal resources in the Caribbean.

[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen?style=for-the-badge)](https://offset.earth/treeware?gift-trees)

Help reforestation efforts [buy the planet a Tree](https://offset.earth/treeware?gift-trees)...

Read more about Treeware at [treeware.earth](http://treeware.earth)

# NOTE #

This is an attempt to port my Atom's extensions to Nova. This extension is undergoing a lot of work and may have a lot of rough edges. 

# Requirements #

This is a vanilla extension and does not require any additional software. 


# Task Scripts #

The sidebar will display a **Tasks** folder which lists all the tasks that you have created or install. 

A task is a vanilla javascript that you can use to automate tasks in Nova. 

The sidebar will show a basic set of icons on its tool bar to add, edit and refresh your tools.

## Create a Task ##

Select the **Tasks** folder and press the "Plus" button to create a new task. This will open a new js document in Nova with the template code of a tool skeleton.

You can also edit the contents of the folder `~/Library/Application Support/Nova/Extensions/EXPW.Tools/tools/` and add your own js file manually.

> If you get a tool script from somebody else, check the source code and only install scripts you obtained from a trusted source.

> Select the **Tasks** folder and press the "Refresh" to reload changes made directly in the file system.

## Edit a Task ##

Select a task and press the pencil icon on the sidebar to edit your task. When you save your task the changes are automatically reloaded.

## Running a Task ##

Double click a task to run it.

## Anatomy of a task ##

A task is a vanilla javascript object with some required properties and functions.

The basic structure of a task is:
```JS
tool = {
id:"hellotool",
name: "Hello World",

//... we add hooks here
}
```

> The script must assign the task object to a `tool` variable.

The following properties are available in the task object:

| Key | Description |
| --- | --- |
| id | String, A unique identifier for your tool. |
| name | String, A human readable name for the tool. |
| tooltip | String, A brief description of the tool for humans. |
| onAction | Function<br>Signature: `function()`<br><br>A hook that will be executed when the user double clicks on the tool or it is executed from a menu.<br><br>Parameters: none. |
| onSave | Function<br>Signature: `function(path, textEditor)`<br><br>A hook that will be executed when the user saves a document in Nova.<br><br>Parameter:<br>`path` String with the file path.<br>`textEditor` Instance of [TextEditor](https://docs.nova.app/api-reference/text-editor/). |


## Writing a task script ##

Basic task is invoked when the user double clicks the entry on the sidebar. This type of task implements the `onAction` hook.

The `onAction` hook is a property of our task object whose value is a function. Inside our hook function we write our code.

When automating a task you may optionally implement the `onSave` hook. This function will be called automatically whenever Nova saves a document. This functions takes two arguments a string with the `path` of the file and the `textEditor` with the instance of the [TextEditor](https://docs.nova.app/api-reference/text-editor/).

In your code you have access to Nova's [API](https://docs.nova.app/api-reference) in addition we provide a simple helper with common tasks.

## Helpers ##

This extension adds some JS objects to help you create quick tasks without having to dive into Nova's [API](https://docs.nova.app/api-reference).

The `ide` object provides a set of functionality to interact with NOVA and the filesystem. This object is available globally in your script.


`ide.revealInFinder( aPath )`

Reveals the file or folder given in `aPath`.

`ide.openFile( aPath )`

Opens the document referenced in `aPath` in Nova. If already open it will be activated.

`ide.readFile( aPath )`

Returns a string with the contents of a file given in the absolute path `aPath` or `null` if unable to read the file.

`ide.writeFile: function(path, data)`

Writes the contents of `data` to the specified path. Returns `true` on success else it returns `false`.

`ide.readJSON( aPath )`

On success it returns the parsed JSON data (object/array) of the file given in `aPath`, else `null` is returned.

`ide.isPathOpen( aPath )`

Returns true if the absolute path in `aPath` is currently open in Nova.

`ide.isPathInWorkspace( aPath, workspace )`

Returns true if the path in `aPath` is part of the active workspace. When the parameter `workspace` is not provided the current workspace is checked, else the [Workspace](https://docs.nova.app/api-reference/workspace/) instance passed in `workspace` is used.

`ide.getTextEditorForPath(aPath)`

Returns the [TextEditor](https://docs.nova.app/api-reference/text-editor/) for the absolute path given in `aPath` if the document is currently open in Nova.

`ide.showNotification(title, msg)`

Shows a passive notification to the user. Where `title` is a string with the notification title, and `msg` is a string with the notifications body.

`ide.showAlert(msg)`

Displays an alert with the given message in the string `msg`.

`ide.interpolate(sIn, values)` 

Performs variable substitution on the string given in `sIn`. The parameter `sIn` may also be an array of strings. You may optionally pass a plain object of key-value pairs with additional variables to replace.

Built-In Variables:

<div style="padding-left: 45px;">
`${userHome}` - the path of the user's home folder.<br>
`${workspaceFolder}` - the path of the project folder..<br>
`${file}` - the current opened file.<br>
`${relativeFile}` - the current opened file relative to workspaceFolder.<br>
`${relativeFileDirname}` - the current opened file's dirname relative to `workspaceFolder`.<br>
`${fileBasename}` - the current opened file's basename.<br>
`${fileBasenameNoExtension}` - the current opened file's basename with no file extension.<br>
`${fileDirname}` - the current opened file's dirname.<br>
`${fileExtname}` - the current opened file's extension.<br>
</div>

`ide.on(event, callback)`

Register a callback for an event.

| Event | Description |
| --- | --- |
| `doc-added` | A TextEditor was created. Arguments:<br>`textEditor` The instance of the TextEditor. |
| `doc-destroyed` | A TextEditor was close. Arguments:<br>`textEditor` The instance of the TextEditor. |
| `doc-changed` | The contents of a TextEditor changed. Arguments:<br>`textEditor` The instance of the TextEditor. |
| `doc-saved` | A TextEditor was saved. Arguments:<br>`textEditor` The instance of the TextEditor. |
| `doc-syntax-changed` | The syntax of a TextEditor changed. Arguments:<br>`textEditor` The instance of the TextEditor.<br>`syntax` The name of the syntax. |


`ide.getFileInfo(path)`

Returns a plain object with related information about a filesystem path. The returned object has the following keys:

```js
{
	name,
	path,
	dirName,
	ext,
	exists,
	isDirectory,
	isWritable,
	isReadable,
	isSymbolicLink,
	isExecutable,
	icon, mode, size
};
```

### Editor ###

The `editor` object is a helper that simplifies interaction and common tasks related to a [TextEditor](https://docs.nova.app/api-reference/text-editor/). This object is available globally in your script.

| Properties |
| --- |
| `editor.syntax`<br><br>String property with the syntax of the editor. |
| `editor.path`<br><br>String property with the path to the document open or null. |
| `editor.filename`<br><br>String property with the file name of the document open or null. |
| `editor.directory`<br><br>String property with the directory of the document open or null. |
| `editor.textEditor`<br><br>The instance of the active [TextEditor](https://docs.nova.app/api-reference/text-editor/). |

| Methods |
| --- |
| `editor.getSelectedText()`<br><br>Returns the selected text. |
| `editor.insertText(text)`<br><br>Insert the string given in `text` in the current insertion point. If the editor had a selection it will be replaced. |
| `editor.insertSnippet(text)`<br><br>Insert the string given in `text` in the current insertion point as a [snippet](https://docs.nova.app/extensions/snippets/). If the editor had a selection it will be replaced. |
| `editor.save()`<br><br>Save the text editor contents. |


### Process ###

Nova provides a [process](https://docs.nova.app/api-reference/process/) object that you can use to run shell commands among others.

Alternatively we provide the `ide.process(cmd, args)` function to simplify executing shell commands.

`ide.process(cmd, args)`
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
| `cwd` | The current working directory. Can be set anytime before you call `run()`. The default value of `cwd` is the folder of the active TextEditor or the home folder of the user. |
| `shell` | If `true` then `/bin/sh` is used, else set to a string with the path to the desired shell. Can be set anytime before you call `run()`. |
| `results` | String. The output of the command received in StdOut. |
| `stdErr` | String. The output of the command received in StdErr. |
| `exitCode` | Numeric. The exit code of the child process. |

Example 1:

```js
//use async/await to wait for process to run...
onSave: async function(path, textEditor){
	const p = helper.process("ls", ["-la", path]);
	await p.run();
	console.log("out=%s", p.results);
}
```

Example 2:
```js
onSave: function(path, textEditor){
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
onSave: function(path, textEditor){
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

2. To get the active [TextEditor](https://docs.nova.app/api-reference/text-editor/):

```js
onAction:function(){
	
	//using wrapper
	let textEditor1 = editor.textEditor; 
	
	//using Nova's API
	let textEditor2 = nova.workspace.activeTextEditor;
	if(!textEditor2) return;
}
```



