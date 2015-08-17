#!/usr/bin/env node

// Get CLI params
var args = process.argv.slice(2, process.argv.length);

// Usage string
var usageString = "Usage: node kolony.js CreateProject \"Project Path\" \"Project Name\"\n - Project Path is the path (relative or absolute) for the Project\n - Project Name has to be alphanumeric and is the Project Folder Name"

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

// Second arg should be either Project Path
// @ToDo check if path exists
if (! args[1].match(/^[a-zA-Z0-9 -_.\/]+$/)) {
    console.log(usageString);
    process.exit(1);
}

// Third arg should be Project Name
if (! args[2].match(/^[a-zA-Z0-9]+$/)) {
    console.log(usageString);
    process.exit(1);
}

// Allow Exec to run git clone and other shell commands
var child = require('child_process');

// Remove the last / from the project path if it has one
var project = args[1].replace(/\/$/, "");
    project = project + "/" + args[2]


// Ready to create the new project
console.log('Ready to clone!');
child.exec("git clone https://github.com/KolonyIO/kolony-start-app.git " + project, function(error, stdout, stderr) {
    if (error) throw error;
    if (stdout) console.dir(stdout);
    if (stderr) console.dir(stderr);

    // Run install
    console.log('Installing project');
    child.exec("cd " + project + " && sh install.sh", function(error, stdout, stderr) {
        if (error) throw error;
        if (stdout) console.dir(stdout);
        if (stderr) console.dir(stderr);

        console.log('Ready to start working in ' + project);
    });

});
