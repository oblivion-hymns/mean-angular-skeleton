/**
 * Pseudo-singleton through which to access application config.
 */
const CONFIG = Symbol.for('mean-angular-skeleton.config');
const mergeJson = require('merge-json');

//Determine if symbol already exists
const globalSymbols = Object.getOwnPropertySymbols(global);
if (globalSymbols.indexOf(CONFIG) == -1)
{
	const env = process.env.NODE_ENV;
	if (!env)
	{
		throw 'Must provide NODE_ENV environment variable';
	}

	//Determine configuration based on environment
	const coreConfig = require('./config.json');
	const envConfigPath = './config-' + env  + '';
	const envConfig = require(envConfigPath);
	const config = mergeJson.merge(coreConfig, envConfig);
	global[CONFIG] = config;
}

//Define singleton
const singleton = {};
Object.defineProperty(singleton, 'instance', {
	get: function() {
		return global[CONFIG];
	}
});

//Make this object immutable
Object.freeze(singleton);

module.exports = singleton;
