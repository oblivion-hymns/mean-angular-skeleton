const BuildingAgency = require('./building-agency');
const BuildingAgencyHealthDao = require('./building-agency-health-dao');

class BuildingAgencyIncidentDao
{
	/**
	 * Saves form data for one incident for a given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @param string incidentId
	 * @param any[] formData - Array of objects in the format {fieldId: string, value: mixed}
	 * @return Promise
	 */
	saveIncidentData(buildingId, agencyId, incidentId, formData)
	{
		const params = {
			agencyId: agencyId,
			buildingId: buildingId
		};
		const promise = BuildingAgency.findOne(params).then(buildingAgency => {
			let sanitizedData = [];
			for (let i = 0; i < formData.length; i++)
			{
				//So people can't put garbage fields into our database
				const currentFormData = formData[i];

				if (currentFormData.value === '')
				{
					currentFormData.value = null;
				}

				sanitizedData.push({
					fieldId: currentFormData.fieldId,
					value: currentFormData.value
				});
			}

			let incidentExists = false;
			for (let i = 0; i < buildingAgency.incidents.length; i++)
			{
				//If the incident exists, replace the data with this new data
				if (incidentId == buildingAgency.incidents[i].incidentId)
				{
					buildingAgency.incidents[i].fields = sanitizedData;
					incidentExists = true;
					break;
				}
			}

			if (!incidentExists)
			{
				buildingAgency.incidents.push({
					incidentId: incidentId,
					fields: sanitizedData
				});
			}

			return buildingAgency.save();
		}).then(() => {
			const buildingAgencyHealthDao = new BuildingAgencyHealthDao();
			return buildingAgencyHealthDao.updateHealth(buildingId, agencyId);
		});

		return promise;
	}
}

module.exports = BuildingAgencyIncidentDao;
