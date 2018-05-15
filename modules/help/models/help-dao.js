const HelpArticle = require('./help-article');

class HelpDao
{
	/**
	 * Returns the help article with the given identifier
	 * @param string identifier
	 * @return Promise
	 */
	load(identifier)
	{
		let transformedIdentifier = identifier || '';
		transformedIdentifier = transformedIdentifier.trim();
		return HelpArticle.findOne({identifier: transformedIdentifier}).exec();
	}

	/**
	 * Saves the given help article
	 * @param HelpArticle article
	 * @return Promise
	 */
	save(article)
	{
		const findQuery = {identifier: article.identifier};
		const updateQuery = {$set: {content: article.content}};
		const options = {upsert: true};
		return HelpArticle.findOneAndUpdate(findQuery, updateQuery, options).exec();
	}
}

module.exports = HelpDao;
