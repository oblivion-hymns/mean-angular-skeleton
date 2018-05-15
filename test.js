/**
 * To run a full suite of unit tests, run "npm test" from the command line in this project's root.
 * To run individual modules, include their names, separated by spaces, as arguments to "npm test".
 * Examples:
 *	npm test (Tests everything)
 *	npm test building-agency (Tests only the building-agency module)
 *	npm test building contact incident (Tests the building, contact, and incident modules)
 */
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const recursiveReaddirSync = require('recursive-readdir-sync');

const config = require('./config/config').instance;
const dbPort = config.db.port;
const dbSchema = config.db.schema;
const dbUrl = config.db.url;
const dbOptions = config.db.options;
const dbString = 'mongodb://' + dbUrl + ':' + dbPort + '/' + dbSchema;
global.__basePath = __dirname + '/';

var app = express();
mongoose.Promise = global.Promise;
mongoose.connect(dbString, dbOptions);

app.use(express.static(path.join(__dirname, 'public')));

const ModuleLoader = require('./module-loader');
const moduleLoader = new ModuleLoader(app);
moduleLoader.load(config.app.moduleRoot);

const inclusions = parseArgs();

var moduleFiles = fs.readdirSync('./test');
for (let file of moduleFiles)
{
	const moduleName = file;

	if (inclusions.length == 0 || inclusions.indexOf(moduleName) > -1)
	{
		const fullPath = './test/' + file;

		//If we found a directory, that means we're testing a moduleclassName
		const isDir = fs.lstatSync(fullPath).isDirectory();
		if (isDir)
		{
			//Prettify the module name for testing output
			const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
			describe(capitalizedModuleName, function(){

				//Get all javascript files within the module's tests folder
				const files = recursiveReaddirSync(fullPath);
				for (let i = 0; i < files.length; i++)
				{
					const filename = files[i];
					const extension = filename.split('.').pop();
					if (extension == 'js')
					{
						//Found a valid file -- run all tests within that file, and describe() it appropriately
						//const relativePath = filename.replace('test', '.');
						const testClass = require('./' + filename);
						const instance = new testClass();

						//A little more prettification for the sake of human readability
						const className = instance.constructor.name.replace(/Test$/, '');
						describe(className, function(){
							//Run before() function, if available
							if (typeof instance.before === 'function')
							{
								instance.before();
							}

							//Run any method beginning with the word "test" (a la xUnit)
							const objectFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
							for (let j = 0; j < objectFunctions.length; j++)
							{
								const currentFunction = objectFunctions[j];
								if (currentFunction.indexOf('test') == 0)
								{
									instance[currentFunction]();
								}
							}

							//Run after() function, if available
							if (typeof instance.after === 'function')
							{
								instance.after();
							}
						});
					}
				}
			});
		}
	}
}

/**
 * Parses arguments and determines if a subset of modules is being tested.
 * Returns the names of the included modules, if any
 * @return string[]
 */
function parseArgs()
{
	const opts = fs.readFileSync('./test/mocha.opts').toString();
	const processArgs = process.argv;

	//Start at 2 because indices 0 & 1 are node itself and the mocha runner
	let inclusions = [];
	for (let i = 2; i < processArgs.length; i++)
	{
		const currentArg = processArgs[i];
		if (opts.indexOf(currentArg) == -1)
		{
			inclusions.push(currentArg.trim().toLowerCase());
		}
	}

	return inclusions;
}

module.exports = app;
