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
var projectName, projectPath;
require('shelljs/global');

// initialises the project with content from seed and performs the install
function initProject(projectInfo, tempSeedRepositoryDir){
  cp("-r", tempSeedRepositoryDir+"/*", projectInfo.path);

  console.log(projectInfo.path);

  console.log('Installing project');

  var gitOutput = exec("cd " + projectInfo.path + " && sh install.sh").output;
  console.log(gitOutput);

  // set package info to destination project
  console.log('Ready to start working in ' + projectInfo.path);

  environment.projects.push({
    name: projectInfo.name,
    path: projectInfo.path,
    repository: projectInfo.repository
  });
  environment.save();
}

// creates the project by cloning the repository provided, and copying content from seed
function createProject(projectInfo, tempSeedRepositoryDir){

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
          initProject(projectInfo, tempSeedRepositoryDir);
      })
  }else{
    // init project
    initProject(projectInfo, tempSeedRepositoryDir);
  }
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
  // setup a the temp directory to hold the seed project - it;s content will be copied in the new project
  var tempSeedRepositoryDir = path.join(os.tmpdir(), 'kolony', 'seed');
  if (!fs.existsSync(tempSeedRepositoryDir)){
    wrench.mkdirSyncRecursive(tempSeedRepositoryDir);
  }
  console.log("temp dir: "+tempSeedRepositoryDir);

  // if the temp seed dir is already present; make sure it's up tp date; otherwise clone it

  if (fs.existsSync(path.join(tempSeedRepositoryDir, ".git"))){
    require('simple-git')(tempSeedRepositoryDir)
     .pull(function(error, update) {
        if (error){
          conole.log(error);
          process.exit(0);
        }

        createProject(projectInfo, tempSeedRepositoryDir);
     });
  }else{
    require('simple-git')()
      .clone('https://github.com/KolonyIO/kolony-seed.git', tempSeedRepositoryDir, function(error, status){
          createProject(projectInfo, tempSeedRepositoryDir);
      })
  }
})
