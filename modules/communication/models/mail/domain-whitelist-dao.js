const DomainWhitelistEntry = require('./domain-whitelist-entry');

class DomainWhitelistDao
{
	/**
	 * Returns a list of all domains on the whitelist
	 * @return Promise
	 */
	loadAll()
	{
		return DomainWhitelistEntry.find().sort('domain').exec();
	}

	/**
	 * Adds a new domain to the whitelist
	 * @param string domain
	 * @return Promise
	 * @throws Exception - If domain already exists
	 */
	addDomain(domain)
	{
		const entry = new DomainWhitelistEntry({domain: domain});
		return entry.save().catch(error => {
			if (error)
			{
				throw new Error(error);
			}
		});
	}

	/**
	 * Updates the given domain to the new given value
	 * @param string domainId
	 * @param string domain - New value
	 * @return Promise
	 */
	editDomain(domainId, domain)
	{
		return DomainWhitelistEntry.findOneAndUpdate({domain: domain}, {$set: {domain: domain}}).exec();
	}

	/**
	 * Removes the domain with the given ID from the whitelist
	 * @param string domainId
	 * @return Promise
	 */
	removeDomain(domainId)
	{
		return DomainWhitelistEntry.findOneAndRemove({_id: domainId}).exec();
	}

	/**
	 * Returns whether or not the given email is on the whitelist
	 * @param string email
	 * @return Promise
	 */
	isOnWhitelist(email)
	{
		email = email || '';
		email = email.trim().toLowerCase();

		const parts = email.split('@');
		const testDomain = parts[parts.length-1];

		return DomainWhitelistEntry.findOne({domain: testDomain}).exec().then(domain => {
			return !!domain;
		});
	}
}

module.exports = DomainWhitelistDao;
