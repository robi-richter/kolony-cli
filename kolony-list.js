#!/usr/bin/env node
var package = require('./package.json');
var program = require('commander');
var Table = require('cli-table');

var environment = require("./lib/environment.js");

program
  .version(package.version)
  .parse(process.argv);

if (environment.projects.length > 0){
  var table = new Table({ head: ['Name', 'Path', 'Repository'] });
  var values = [];

  // build table content
  environment.projects.forEach(function(project){
    values.push([project.name, project.path, (project.repository || "-")])
  });

  table.push.apply(table, values);
  console.log(table.toString());
}else{
  console.log('\nno kolony projects defined\n\nPlease use "kolony create [name]" command to create a new project\n\n');
}
