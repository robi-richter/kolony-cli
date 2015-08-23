var environment = require("./environment.js");
var resources = require("./resources.js");
var path = require('path');
var fs = require('fs');
var wrench = require('wrench');
var _ = require('underscore');

var self = {
    moduleInfo: undefined,
    currentModule: undefined,
    packageInfo: undefined,
    projectController: undefined
}

// reads content of kolony file
self.readKolonyFile = function(){
  self.moduleInfo = require(path.join(self.currentModule.path, 'kolony.json'));
}

// reads content of package file
self.readPackageFile = function(){
  self.packageInfo = require(path.join(self.currentModule.path, 'package.json'));
}

// writes the packageInfo to file
self.writePackageFile = function(){
  fs.writeFileSync(path.join(self.currentModule.path, 'package.json'), JSON.stringify(self.packageInfo, null, 4));
}

// sets the project controller instance
self.setProjectControllerInstance = function(projectController){
  self.projectController = projectController;
}

// sets the current module
self.setModule = function(module){
  self.currentModule = module;

  self.readKolonyFile();
  self.readPackageFile();
}

// sets the current module by it's name; checks if the module is installed first
self.setModuleByName = function(moduleName){
  var modulesPath = path.join(self.projectController.currentProject.path, 'node_modules');
  var modulePath = path.join(modulesPath, moduleName);

  if (fs.existsSync(modulePath)){
    self.setModule({name: moduleName, path: modulePath});
  }
}

// return all kolony module deopendencies
self.getKolonyDependencies = function(){
  return self.moduleInfo.dependencies;
}
module.exports = self;
