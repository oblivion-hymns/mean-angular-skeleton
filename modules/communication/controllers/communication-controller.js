const DomainWhitelistDao = require('./../models/mail/domain-whitelist-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class CommunicationController
{
	loadAll(req, res)
	{
		const domainWhitelistDao = new DomainWhitelistDao();
		domainWhitelistDao.loadAll().then(domains => {
			return new Response(res, 200, '', {domains: domains});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	addDomain(req, res)
	{
		let domain = req.body.domain;
		if (!domain)
		{
			return new Response(res, 400, '', 'Must provide a valid domain');
		}

		domain = domain.trim().toLowerCase();

		const domainWhitelistDao = new DomainWhitelistDao();
		domainWhitelistDao.addDomain(domain).then(newDomain => {
			return new Response(res, 200, '', {domain: newDomain});
		}).catch(error => {
			console.error(error);
			return new Response(res, 400, '', 'This domain is already on the whitelist');
		});
	}

	editDomain(req, res)
	{
		let domainId = req.body.domainId;
		if (!domainId)
		{
			return new Response(res, 400, '', 'Must provide a valid domain to edit');
		}

		let domain = req.body.domain;
		if (!domain)
		{
			return new Response(res, 400, '', 'Must provide a valid new domain');
		}

		domain = domain.trim().toLowerCase();

		const domainWhitelistDao = new DomainWhitelistDao();
		domainWhitelistDao.editDomain(domainId, domain).then(() => {
			return new Response(res, 200, '');
		}).catch(error => {
			console.error(error);
			return new Response(res, 400, '', 'This domain is already on the whitelist');
		});
	}

	removeDomain(req, res)
	{
		let domainId = req.query.domainId;
		if (!domainId)
		{
			return new Response(res, 400, '', 'Must provide a valid domain to remove');
		}

		const domainWhitelistDao = new DomainWhitelistDao();
		domainWhitelistDao.removeDomain(domainId).then(() => {
			return new Response(res, 200, '');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = CommunicationController;
