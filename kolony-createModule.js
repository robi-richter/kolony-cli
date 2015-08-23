var package = require('./package.json');
var program = require('commander');
var inquirer = require('inquirer');
var path  = require('path');
var fs  = require('fs');
var wrench = require('wrench');
var environment = require("./lib/environment.js");
var projectController = require("./lib/projectController.js");
var moduleName;
require('shelljs/global');


program
  .version(package.version)
  .option('-p, --project [projectName]', 'project where module should be created')
  .arguments('<name>')
  .action(function (name) {
     moduleName = name;
  })
  .parse(process.argv);

// check if a name was passed
if (moduleName === undefined){
    console.log('\n please specify a module name! \n use: "kolony help" for more info\n')
    process.exit(0);
}

// if project option has been sent, use it to set the current project; otherwise the init will try to use the current directory as the current project, if valid
if (program.project!==undefined){
  projectController.setCurrentProject(program.project);
}

projectController.init(true);


var questions = [
  {
    type: 'input',
    name: 'repository',
    message: 'Repository url'
  }
];

inquirer.prompt(questions, function(moduleInfo){
  projectController.createModule(moduleName, moduleInfo.repository, function(error, data){
    if (error){
      console.log(error);
      process.exit(0);
    }

    console.log('module '+moduleName+' created successfully');
  });
});
