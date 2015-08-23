#!/usr/bin/env node

var program = require('commander');
var package = require('./package.json');

program
  .version(package.version)
  .command('list', 'lists all existing projects', {isDefault: true})
  .command('create [name] [path]', 'create a new project')
  .command('add [path]', 'add a project to the environemnt')
  .command('createModule [name]', 'create a module within the current project')
  .command('installModule [name] [repository]', 'install a module within the current project')
  //.option('-p, --project [projectName]', 'project where module should be created')
  .parse(process.argv);
