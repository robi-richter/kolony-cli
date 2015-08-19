#!/usr/bin/env node

var program = require('commander');
var package = require('./package.json');

program
  .version(package.version)
  .command('list', 'lists all existing projects', {isDefault: true})
  .command('create [name] [path]', 'create a new project')
  .parse(process.argv);
