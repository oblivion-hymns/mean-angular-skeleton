const HelpDao = require('./../models/help-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class HelpController
{
	load(req, res)
	{
		const identifier = req.params.identifier;
		const helpDao = new HelpDao();
		helpDao.load(identifier).then(article => {
			return new Response(res, 200, '', {article: article});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	save(req, res)
	{
		const article = req.body.article;
		const helpDao = new HelpDao();
		helpDao.save(article).then(help => {
			return new Response(res, 200, '', {help: help});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = HelpController;
