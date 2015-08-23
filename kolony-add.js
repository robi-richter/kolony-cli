var package = require('./package.json');
var program = require('commander');
var inquirer = require('inquirer');
var fs = require('fs');
var path  = require('path');

var environment = require("./lib/environment.js");
var projectInfo = {
  name: undefined,
  path: undefined
};

program
  .version(package.version)
  .arguments('<path>')
  .action(function (path) {
     projectInfo.path = path.replace(/\/$/, "");
  })
  .parse(process.argv);

  var kolonyFilePath = path.join(projectInfo.path, 'kolony.json');

  if (! fs.existsSync(kolonyFilePath)){
    console.log('given path is not a valid Kolony project');
    procerss.exit(0);
  }

  if (environment.projectExistsByPath(projectInfo.path)){
    project  = environment.getProjectByPath(projectInfo.path);
    console.log("given path is already defined as a project ("+project.name+");\n please use 'kolony list' to see all defined projects ");
    process.exit(0);
  }

  var kolonyInfo = require(kolonyFilePath);
  environment.projects.push({
    name: kolonyInfo.name,
    path: projectInfo.path,
    repository: ((kolonyInfo.repository && kolonyInfo.repository.url)?kolonyInfo.repository.url:undefined)
  });
  environment.save();
  console.log(kolonyInfo);
