const path = require('path');
const resolverConfig = require('./../../../../config/template-resolver');

class TemplateResolver
{
	constructor()
	{
		this.basePath = path.dirname(require.main.filename);
	}

	/**
	 * Attempts to resolve the given template name to a path.
	 * Returns the fully-resolved path to the file
	 * @param string templateName
	 * @return string
	 */
	resolve(templateName)
	{
		if (!templateName)
		{
			throw new Error('Must provide template name');
		}

		if (!resolverConfig[templateName])
		{
			throw new Error('Could not find templateName ' + templateName);
		}

		const fullTemplatePath = this.basePath + resolverConfig[templateName];
		return fullTemplatePath;
	}
}

module.exports = TemplateResolver;
