var fs = require('fs');

/**
 * Autoloads modules & their properties
 */
class ModuleLoader
{
	constructor(app)
	{
		this.app = app;
	}

	/**
	 * Loads modules based on folder structure
	 * @param string moduleRoot - Path to folder that includes modules
	 */
	load(moduleRoot)
	{
		var modules = [];

		//Parse all module names
		var moduleFiles = fs.readdirSync(moduleRoot);
		for (let i in moduleFiles)
		{
			var file = moduleFiles[i];
			var path = moduleRoot + '/' + file;
			if (fs.lstatSync(path).isDirectory())
			{
				var routeFile = path + '/' + 'routes.js';
				if (fs.existsSync(routeFile))
				{
					modules.push(file);
				}
			}
		}

		//Load routes for all modules
		if (modules.length > 0)
		{
			for (let i = 0; i < modules.length; i++)
			{
				var name = modules[i];
				var routeFilePath = moduleRoot + '/' + name + '/routes';
				var routeRoot = '/' + name;
				var routes = require(routeFilePath);
				this.app.use(routeRoot, routes);
			}
		}

		//Base route
		var baseRoutes = require(moduleRoot + '/routes');
		this.app.use('/', baseRoutes);

		console.log('Loaded modules: ' + modules.join(', '));
	}
}

module.exports = ModuleLoader;
