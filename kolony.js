
// Get CLI params
var args = process.argv.slice(2, process.argv.length);

var usageString = "Usage: node kolony.js createProject \"Project Path\" \"Project Name\"\n - Project Path is the path (relative or absolute) for the Project\n - Project Name has to be alphanumeric and is the Project Folder Name"

// 3 Args ... first CreateProject ... second Project Path ... third Project Name
if (3 > args.length) {
	console.log(usageString);
	process.exit(1);
}


// First arg should be CreateProject
if ("createproject" !== args[0].toLowerCase()) {
	console.log(usageString);
	process.exit(1);
}

// Second arg should be Project Path
// @ToDo check if path exists
if (! args[1].match(/^[a-zA-Z0-9]+$/)) {
	console.log(usageString);
	process.exit(1);
}

// Third arg should be Project Name 
if (! args[2].match(/^[a-zA-Z0-9]+$/)) {
	console.log(usageString);
	process.exit(1);
}

var projectPath = args[1];
// Remove the last / from the project path if it has one
projectPath = projectPath.replace(/\/$/, "");
var projectName = args[2];

var exec = require('child_process').exec;

// Ready to create the new project
console.log('Ready to clone!');
var gitOutput = exec("git clone https://github.com/KolonyIO/kolony-start-app.git " + projectPath + "/" + projectName).output;
console.dir(gitOutput);