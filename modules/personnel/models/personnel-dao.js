const ApiService = require('./../../api/models/api-service');

class PersonnelDao
{
	/**
	 * Given a Sequoia "Employee" response, returns just the value of the employee key
	 * @param any[] data
	 * @return Personnel[]
	 */
	convertToPersonnel(data)
	{
		return data.employees;
	}

	/**
	 * Loads a single personnel with the given ID
	 * @param string id
	 * @return Promise
	 */
	loadOne(id)
	{
		const apiService = new ApiService();
		const promise = apiService.apiGet('/employee/' + id);
		return promise;
	}

	/**
	 * Loads a list of all personnel in the given building
	 * @param string buildingId
	 * @return Promise
	 */
	loadForBuilding(buildingId)
	{
		const apiService = new ApiService();
		const params = {
			buildingid: buildingId,
			include: 'agency,building'
		};
		const promise = apiService.apiGet('/employee/building', params).then(employees => {
			return this.convertToPersonnel(employees);
		});
		return promise;
	}

	/**
	 * Loads a list of all personnel in the given building
	 * @param string buildingId
	 * @param string floor
	 * @return Promise
	 */
	loadForBuildingAndFloor(buildingId, floor)
	{
		const apiService = new ApiService();
		const params = {
			buildingid: buildingId,
			floor: floor,
			include: 'agency,building'
		};
		const promise = apiService.apiGet('/employee/building', params).then(employees => {
			return this.convertToPersonnel(employees);
		});
		return promise;
	}
}

module.exports = PersonnelDao;
