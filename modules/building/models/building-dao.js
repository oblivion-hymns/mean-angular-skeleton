const ApiService = require('./../../api/models/api-service');

class BuildingDao
{
	/**
	 * Loads a single building with the given ID
	 * @param string id
	 * @return Promise
	 */
	loadOne(id)
	{
		const apiService = new ApiService();
		const promise = apiService.apiGet('/building/' + id, {include: 'agency'});
		return promise;
	}

	/**
	 * Returns a list of all buildings
	 */
	loadAll()
	{
		const apiService = new ApiService();
		const promise = apiService.apiGet('/building/all');
		return promise;
	}

	/**
	 * Returns a list of all buildings belonging to the given agency
	 */
	loadForAgency(agencyId)
	{
		const apiService = new ApiService();
		const promise = apiService.apiGet('/building/agency', {agencyId: agencyId});
		return promise;
	}

	/**
	 * Returns a list of buildings based on a given search criteria
	 */
	search(query)
	{
		const apiService = new ApiService();
		const promise = apiService.apiGet('/building/search', {query: query});
		return promise;
	}
}

module.exports = BuildingDao;
