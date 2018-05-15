const fs = require('fs');
const TemplateResolver = require('./template-resolver');

/**
 * Handles parsing of HTML templates
 */
class TemplateParser
{
	/**
	 * Resolves the given templateName and returns the content of the template concatenated with the given args
	 * @param string templateName - Name of an HTML template to be resolved
	 * @param any args - Optional. Arguments to replace in the template, notated in the HTML file in {{ }}
	 * @return Promise
	 */
	parse(templateName, args)
	{
		args = args || {};

		const templateResolver = new TemplateResolver();
		const templatePath = templateResolver.resolve(templateName);

		var promise = new Promise(function(resolve, reject){
			fs.readFile(templatePath, {encoding: 'utf-8'}, function(error, html){
				if (error)
				{
					reject(error);
					return;
				}

				for (let arg in args)
				{
					if (args.hasOwnProperty(arg))
					{
						const argKey = arg;
						const argValue = args[arg];
						const keyRegex = new RegExp('{{' + argKey + '}}', 'g');
						html = html.replace(keyRegex, argValue);
					}
				}

				resolve(html);
			});
		});

		return promise;
	}
}

module.exports = TemplateParser;
