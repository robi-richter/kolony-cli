#!/usr/bin/env node
var package = require('./package.json');
var program = require('commander');
var inquirer = require('inquirer');
var child = require('child_process');
var os = require('os');
var path  = require('path');
var fs  = require('fs');
var extfs  = require('extfs');
var wrench = require('wrench');
var environment = require("./lib/environment.js");
var resources = require("./lib/resources.js");
var projectName, projectPath;
require('shelljs/global');

// initialises the project with content from seed and performs the install
function initProject(projectInfo, tempSeedRepositoryDir){
  resources.copyProjectSeedToFolder(projectInfo.path, function(error, data){
    if (error){
      console.log(error);
      process.exit(0);
    }

    console.log('Installing project');

    var gitOutput = exec("cd " + projectInfo.path + " && sh install.sh").output;
    console.log(gitOutput);

    // set package info to destination project
    console.log('Ready to start working in ' + projectInfo.path);

    // customise the package.json file
    var appPackageFile = path.join(projectInfo.path, 'package.json');
    var appPackage = require(appPackageFile);

    appPackage.name = projectInfo.name;
    appPackage.description = projectInfo.name+" kolony project";
    if (projectInfo.useRepository){
      appPackage.repository = {
        type: "git",
        url: projectInfo.repository
      }
    }else{
      appPackage.repository = {}
    }
    appPackage.author = "";
    appPackage.license = "";

    fs.writeFileSync(appPackageFile, JSON.stringify(appPackage, null, 4));

    // customise the kolony.json file
    var appKolonyFile = path.join(projectInfo.path, 'kolony.json');
    var appKolonyInfo = require(appKolonyFile);

    appKolonyInfo.name = projectInfo.name;
    appKolonyInfo.version = '0.0.1';
    appKolonyInfo.repositoty = {
      "type": "git",
      "url": projectInfo.repository
    };

    fs.writeFileSync(appKolonyFile, JSON.stringify(appKolonyInfo, null, 4));


    // add the project to the current environment
    environment.projects.push({
      name: projectInfo.name,
      path: projectInfo.path,
      repository: projectInfo.repository
    });
    environment.save();
  });
}

program
  .version(package.version)
  .arguments('<name> <path>')
  .action(function (name, path) {
     projectName = name;
     projectPath = path;
  })
  .parse(process.argv);

// check if a name was passed
if (projectName === undefined){
    console.log('\n please specify a project name! \n use: "kolony help" for more info\n')
    process.exit(0);
}

if (projectPath === undefined){
    console.log('\n please specify a project path! \n use: "kolony help" for more info\n')
    process.exit(0);
}
// stop if project already exists
if (environment.projectExists(projectName)){
  console.log('\n project '+projectName+' already exists!');
  process.exit(0);
}

var questions = [
  {
    type: 'confirm',
    name: 'useRepository',
    message: 'Would you like to use a git repository for your project?'
  },
  {
    type: 'input',
    name: 'repository',
    message: 'Repository url',
    when: function(answers){
      return answers.useRepository
    }
  }
];

inquirer.prompt(questions, function(projectInfo){

  projectInfo.name = projectName;
  projectInfo.path = projectPath;

  // check if provided path exists, if not, create it
  if (!fs.existsSync(projectInfo.path)){
    wrench.mkdirSyncRecursive(projectInfo.path);
  }

  // check if it's empty; if not fail
  if (! extfs.isEmptySync(projectInfo.path)){
    console.log(projectInfo.path+' is not empty!');
    process.exit(0);
  }

  if (projectInfo.useRepository){
    require('simple-git')()
      .clone(projectInfo.repository, projectInfo.path, function(error, status){
          if (error){
            console.log(error);
            process.exit(0);
          }
          // init project
          initProject(projectInfo);
      })
  }else{
    // init project
    initProject(projectInfo);
  }
})
