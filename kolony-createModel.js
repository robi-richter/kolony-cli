var package = require('./package.json');
var program = require('commander');
var inquirer = require('inquirer');
var path  = require('path');
var fs  = require('fs');
var wrench = require('wrench');
var environment = require("./lib/environment.js");
var projectController = require("./lib/projectController.js");
var modelName;
require('shelljs/global');


program
  .version(package.version)
  .option('-p, --project [projectName]', 'project where model should be created')
  .option('-m, --module [moduleName]', 'module where model should be created')
  .arguments('<name>')
  .action(function (name) {
     modelName = name;
  })
  .parse(process.argv);

// check if a name was passed
if (modelName === undefined){
    console.log('\n please specify a model name! \n use: "kolony help" for more info\n')
    process.exit(0);
}

// if project option has been sent, use it to set the current project; otherwise the init will try to use the current directory as the current project, if valid

if (program.module===undefined){
  console.log("please specify a module name");
  process.exit(0);
}
if (program.project!==undefined){
  projectController.setCurrentProject(program.project);
}

projectController.init(true);

projectController.moduleController.setModuleByName(program.module);

projectController.moduleController.createModel(modelName, function(error){
  if (error){
    console.log(error);
  }
});
//copyModelToFolder
