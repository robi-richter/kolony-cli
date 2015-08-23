# kolony-cli

Provides a command line interface to manage KolonyIO projects

## Project Specific Commands

  * `kolony list` Projects Inventory; Lists all KolonyIO projects defined and registered on your system
  * `kolony create projectName /project/Path` Create a blank KolonyIO project at the desired path.
    where:
      * `projectName` - name of the new project
      * `projectPath` - target path

  You will be asked if you would like to use a git repository with the project. If yes, please specify a git repository in the following format:
    `git@github.com:[GitHubUser]/[projectName].git`

  * `kolony add /project/Path` Add Existing Project To Inventory Use this to add a KolonyIO project you created without using the `kolony-cli`

## Module Specific Commands

  * `kolony createModule moduleName [-p projectName]` create a new KolonyIO module in the specified project; if `-p | --project` is specified, the current working path will be used if a valid KolonyIO project as the target for the module
  * `kolony installModule moduleName moduleRepository [-p projectName]` install a kolony module in the specified project. Same as above, if not `-p|--project` is specified the current working path will be used if it's a valid KolonyIO project.

    Usage Example:
      * `kolony installModule git@github.com:KolonyIO/kolony-module-users.git -p test` install a module by giving it's full git repository path
      * `kolony installModule kolony-module-users` install a module by it's name; this will fetch all `npm`, `github` and `bitbucket` repositories that match the module name; (for `bitbucket` fetching see `bitbucket integration` section bellow.
      * `kolony installModule kolony` install a module by searching though available npm packages / github / bitbucket repositories that contain the 'kolony' string; Please note that if you use `kolony installModule kolony-module` you can narrow down the modules / repos listed to a more accurate list


## TODO (future commands)
### Project Commands
  * `kolony remove projectName`
  * `kolony info projectName`
  * `kolony status projectName`
  * `kolony update projectName [-r|--recorsive]`
  * `kolony start|stop|restart|logs projectName`

### Module Commands
  * `kolony [-p projectName] extendModule [sourceModuleName] [sourceModuleGitRepo] newModuleName newModuleGitRepo`
  * `kolony [-p projectName] -m moduleName createModel modelName`
  * `kolony [-p projectName] -m moduleName createController controllerName`
  * `kolony [-p projectName] -m moduleName createApi apiName`
  * `kolony [-p projectName] -m moduleName extendModel modelName`
  * `kolony [-p projectName] -m moduleName extendController controllerName`
  * `kolony [-p projectName] -m moduleName extendApi apiName`

### Manager Commands
  * `kolony manager status|start|stop|restart projectName [--port managerPort]`
  * `kolony manager web projectName`
