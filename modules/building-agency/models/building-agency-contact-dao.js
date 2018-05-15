const mongoose = require('mongoose');
const BuildingAgency = require('./building-agency');
const BuildingAgencyDao = require('./building-agency-dao');
const BuildingAgencyHealthDao = require('./building-agency-health-dao');
const BuildingAgencyIncidentDao = require('./building-agency-incident-dao');

class BuildingAgencyContactDao
{
	/**
	 * Adds the given contact to the given incident on the given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @param string incidentId
	 * @param string contactId
	 * @return Promise
	 */
	addContactToIncident(buildingId, agencyId, incidentId, contactId)
	{
		const contactObjectId = mongoose.Types.ObjectId(contactId);

		//This is a little more complicated than just running an update query, because the keys may or may not exist,
		//and even if they do exist, they may or may not match a find since we have to search for a specific subdoc
		const buildingAgencyDao = new BuildingAgencyDao();
		return buildingAgencyDao.loadOne(buildingId, agencyId).then(bau => {

			let foundIncident = false;
			for (let i = 0; i < bau.incidents.length; i++)
			{
				if (bau.incidents[i].incidentId == incidentId)
				{
					foundIncident = true;
					break;
				}
			}

			if (!foundIncident)
			{
				//If we did not find the incident on this BAU, create it first
				const bauIncidentDao = new BuildingAgencyIncidentDao();
				return bauIncidentDao.saveIncidentData(buildingId, agencyId, incidentId, []);
			}
		}).then(() => {
			const findQuery = {
				buildingId: buildingId,
				agencyId: agencyId,
				'incidents.incidentId': incidentId
			};
			const updateQuery = {
				$addToSet: {
					'incidents.$.contacts': contactObjectId
				}
			};
			return BuildingAgency.findOneAndUpdate(findQuery, updateQuery).exec();
		}).then(() => {
			const buildingAgencyHealthDao = new BuildingAgencyHealthDao();
			return buildingAgencyHealthDao.updateHealth(buildingId, agencyId);
		}).then(() => {
			return buildingAgencyDao.loadOne(buildingId, agencyId);
		});
	}

	/**
	 * Removes the given contact from the given incident on the given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @param string incidentId
	 * @param string contactId
	 * @return Promise
	 */
	removeContactFromIncident(buildingId, agencyId, incidentId, contactId)
	{
		const contactObjectId = mongoose.Types.ObjectId(contactId);
		const findQuery = {
			buildingId: buildingId,
			agencyId: agencyId,
			'incidents.incidentId': incidentId
		};
		const updateQuery = {
			$pull: {
				'incidents.$.contacts': contactObjectId
			}
		};
		return BuildingAgency.findOneAndUpdate(findQuery, updateQuery).exec().then(() => {
			const buildingAgencyHealthDao = new BuildingAgencyHealthDao();
			return buildingAgencyHealthDao.updateHealth(buildingId, agencyId);
		}).then(() => {
			const buildingAgencyDao = new BuildingAgencyDao();
			return buildingAgencyDao.loadOne(buildingId, agencyId);
		});
	}
}

module.exports = BuildingAgencyContactDao;
