#!/usr/bin/env node
var package = require('./package.json');
var program = require('commander');

var environment = require("./lib/environment.js");

program
  .version(package.version)
  .parse(process.argv);

console.log('version: '+package.version);
console.log('env file: '+environment.getEnvFile());
console.log('projects defined: '+environment.projects.length);
