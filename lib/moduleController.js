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

// creates a new model within the current module
self.createModel = function(modelName, callback){
  var modelsPath = path.join(self.currentModule.path, 'models');
  var modelPath = path.join(modelsPath, modelName+'.js');

  if (! fs.existsSync(modelsPath)){
    wrench.mkdirSyncRecursive(modelsPath);
  }

  if (fs.existsSync(modelPath)){
    return callback(new Error(modelName+" already exists in "+self.currentModule.name+" ("+self.projectController.currentProject.name | self.projectController.currentProject.name +")"));
  }

  resources.copyModel(modelPath, function(error){
    if (error) return callback(error)

    var content = fs.readFileSync(modelPath).toString();
    content = content.replace(new RegExp("__NAME__", "g"), modelName);
    fs.writeFileSync(modelPath, content);

    console.log("model "+modelName+" was successfully created ('"+modelPath+"')");
    callback();
  });
}

// creates a new model within the current module
self.createController = function(controllerName, modelName, callback){
  var controllersPath = path.join(self.currentModule.path, 'controllers');
  var controllerPath = path.join(controllersPath, controllerName+'.js');

  if (! fs.existsSync(controllersPath)){
    wrench.mkdirSyncRecursive(controllersPath);
  }

  if (fs.existsSync(controllerPath)){
    return callback(new Error(controllerName+" controller already exists in "+self.currentModule.name+" ("+self.projectController.currentProject.name | self.projectController.currentProject.name +")"));
  }

  resources.copyController(controllerPath, function(error){
    if (error) return callback(error)

    /** replace the values inside the file **/
    var values = {
      __CONTROLLER_NAME_UCF__: controllerName,
      __CONTROLLER_NAME__: controllerName.toLowerCase(),
      __MODULE_NAME__: self.currentModule.name,
      __MODEL_NAME__: modelName
    }

    var content = fs.readFileSync(controllerPath).toString();
    Object.keys(values).forEach(function(placeholder){
      content = content.replace(new RegExp(placeholder, "g"), values[placeholder]);
    });
    fs.writeFileSync(controllerPath, content);

    console.log("controller "+controllerName+" was successfully created ('"+controllerPath+"')");
    callback();
  });
}

// creates a new model within the current module
self.createApi = function(apiName, controllerName, modelName, callback){
  var apisPath = path.join(self.currentModule.path, 'api');
  var apiPath = path.join(apisPath, apiName+'.js');

  if (! fs.existsSync(apisPath)){
    wrench.mkdirSyncRecursive(apisPath);
  }

  if (fs.existsSync(apiPath)){
    return callback(new Error(apiName+" api already exists in "+self.currentModule.name+" ("+self.projectController.currentProject.name | self.projectController.currentProject.name +")"));
  }

  resources.copyApi(apiPath, function(error){
    if (error) return callback(error)

    /** replace the values inside the file **/
    var values = {
      __CONTROLLER_NAME_UCF__: controllerName,
      __CONTROLLER_NAME__: controllerName.toLowerCase(),
      __MODULE_NAME__: self.currentModule.name,
      __MODEL_NAME__: modelName,
      __API_NAME__: apiName
    }

    var content = fs.readFileSync(apiPath).toString();
    Object.keys(values).forEach(function(placeholder){
      content = content.replace(new RegExp(placeholder, "g"), values[placeholder]);
    });
    fs.writeFileSync(apiPath, content);

    console.log("api "+apiName+" was successfully created ('"+apiPath+"')");
    callback();
  });
}

module.exports = self;
