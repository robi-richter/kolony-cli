var package = require('./package.json');
var program = require('commander');
var inquirer = require('inquirer');
var path  = require('path');
var fs  = require('fs');
var async = require('async');
var wrench = require('wrench');
var environment = require("./lib/environment.js");
var sources = require('./lib/sources.js');
var projectController = require("./lib/projectController.js");
var moduleName;
var moduleRepository;
require('shelljs/global');


program
  .version(package.version)
  .option('-p, --project [projectName]', 'project where module should be created')
  .option('-m, --mode [installMode]', 'install mode to use (git / npm)', 'npm')
  .arguments('<name> [repository]')
  .action(function (name, repository) {
     moduleName = name;
     moduleRepository = repository;
  })
  .parse(process.argv);

// if project option has been sent, use it to set the current project; otherwise the init will try to use the current directory as the current project, if valid
if (program.project!==undefined){
  projectController.setCurrentProject(program.project);
}


// check if a name was passed
if (moduleName === undefined && moduleRepository === undefined){
    console.log('\n please specify a module name or a module repository! \n use: "kolony help" for more info\n')
    process.exit(0);
}

projectController.init(true);

// by default set to true, because if nothing is passed errors out (see above)
var haveName = true;
var haveRepository = true;
// check if only a repository was passed
if (moduleName.indexOf(".git")>0){
  moduleRepository = moduleName;
  //git+ssh@github.com:KolonyIO/kolony-module-users.git
  moduleName = moduleRepository.substring((moduleRepository.lastIndexOf('/')+1), moduleRepository.indexOf('.git'));
  haveName = false;
}

haveRepository = (moduleRepository!==undefined)

if (haveName && ! haveRepository){
  console.log('searching for modules ...');
  sources.search(moduleName, function(error, results){
    if (error){
      console.log(error);
      process.exit(0);
    }

    var indexedResults = {};
    var options = [];
    results.forEach(function(result){
      var index = "";
      switch(result.type){
        case 'github':
          index = '(github) '+result.name+'  ('+result.repository.ssh_url+')';
        break;
        case 'npm':
          index = '(npm) '+result.name+'  ('+result.package.version+')';
        break;
        case 'bitbucket':
        break;
      }

      indexedResults[index] = result;
      options.push(index);
    });

    inquirer.prompt([
      {
        type: "list",
        name: "module",
        message: "Which module would you like to install?",
        choices: options
      }
    ], function( answers ) {
      var selected = indexedResults[answers.module];

      var name = undefined;
      var mode = undefined;
      var repository = undefined;

      switch (selected.type) {
        case 'npm':
          mode = 'npm';
          name = selected.package.name;
        break;
        case 'github':
          mode = 'git';
          name = selected.repository.name;
          repository = selected.repository.ssh_url;
        break;
        case 'bitbucket':
          mode = 'git';
          //name = selected.repository.name;
          //repository = selected.repository.ssh_url;
        break;
      }

      projectController.installModule(mode, name, repository, function(error){
        if (error){
          console.log(error);
          process.exit(0);
        }

        console.log(name+' installed successfully!');
      });
    });
  }, true);


}else{
  if (haveRepository) {
    projectController.installModule('git', moduleName, moduleRepository, function(error){
      if (error){
        console.log(error);
        process.exit(0);
      }
    });
  }
}
