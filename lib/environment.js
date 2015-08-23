var path = require('path');
var fs = require('fs');

var environmentDir = path.join(__dirname , '../', 'etc');
var environmentFile = path.join(environmentDir, 'environment.json');

// create the etc folder if not present
if (!fs.existsSync(environmentDir)){
  fs.mkdirSync(environmentDir, 0744);
}

// init the environment file if not present
if (!fs.existsSync(environmentFile)){
  fs.writeFileSync(environmentFile, JSON.stringify([]), { overwrite: false });
}

var environment = {
  projects: require(environmentFile)
}

// write the current environment to file
environment.save = function(){
  fs.writeFileSync(environmentFile, JSON.stringify(environment.projects, null, 4));
};

// checks if a project already exists by it's name
environment.projectExists = function(projectName){
  return (environment.getProject(projectName) !== false);
};

// get a project by name
environment.getProject = function(projectName){
  var found = false;
  if (environment.projects.length>0){
    environment.projects.forEach(function(project){
      if (project.name == projectName) {
        found =  project;
      }
    })
  };

  return found;
};

// export it
module.exports = environment;
