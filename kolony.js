#!/usr/bin/env node

var program = require('commander');
var package = require('./package.json');

program
  .version(package.version)
  .command('list', 'lists all existing projects', {isDefault: true})
  .command('env', 'infos about the environment')
  .command('create [name] [path]', 'create a new project')
  .command('add [path]', 'add a project to the environemnt')
  .command('createModule [name]', 'create a module within the current project')
  .command('installModule [name] [repository]', 'install a module within the current project')
  .command('createModel -p projectName -m moduleName [name] ', 'create a new model within the module specified')
  .command('createController -p projectName -m moduleName [controllerName] [modelName]', 'create a new controller fot the given model within the module specified')
  .command('createApi -p projectName -m moduleName [apiName] [controllerName]', 'create a new API fot the given controller within the module specified')
  //.option('-p, --project [projectName]', 'project where module should be created')
  .parse(process.argv);
