const mongoose = require('mongoose');

const BuildingAgency = require('./building-agency');
const BuildingAgencyDao = require('./building-agency-dao');
const IncidentDao = require('./../../incident/models/incident-dao');
const config = require('./../../../config/config').instance;

class BuildingAgencyHealthDao
{
	constructor()
	{
		this.contactExpirationSeconds = config.app.contactExpirationSeconds;
	}

	/**
	 * Updates the health value for the given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @return Promise
	 */
	updateHealth(buildingId, agencyId)
	{
		const incidentHealthPromise = this.getIncidentHealth(buildingId, agencyId);
		const contactHealthPromise = this.getContactHealth(buildingId, agencyId);

		return Promise.all([incidentHealthPromise, contactHealthPromise]).then(data => {
			const incidentHealth = data[0];
			const contactHealth = data[1];
			const totalHealth = incidentHealth + contactHealth;

			const updateQuery = {$set: {health: totalHealth}};
			const findQuery = {buildingId: buildingId, agencyId: agencyId};
			return BuildingAgency.findOneAndUpdate(findQuery, updateQuery, {upsert: true});
		}).then(() => {
			const buildingAgencyDao = new BuildingAgencyDao();
			return buildingAgencyDao.loadOne(buildingId, agencyId);
		});
	}

	getIncidentHealth(buildingId, agencyId)
	{
		const allPublishedFields = this.getPublishedIncidentFields();
		const completedFieldsCount = this.getCompletedBuildingFieldsCount(buildingId, agencyId);

		return Promise.all([allPublishedFields, completedFieldsCount]).then(values => {
			const totalFields = values[0].length;
			const completedFields = values[1];

			let incidentHealth = 0.0;
			if (totalFields > 0)
			{
				//Together, all incident data makes up 50% of building health
				incidentHealth = (completedFields / totalFields) * .5;
			}

			return incidentHealth;
		});
	}

	getCompletedBuildingFieldsCount(buildingId, agencyId)
	{
		const buildingAgencyDao = new BuildingAgencyDao();

		const allPublishedFields = this.getPublishedIncidentFields();
		const buildingAgency = buildingAgencyDao.loadOne(buildingId, agencyId);

		return Promise.all([allPublishedFields, buildingAgency]).then(data => {
			const publishedFields = data[0];
			const bau = data[1];

			let completedFieldCount = 0;
			for (let i = 0; i < publishedFields.length; i++)
			{
				const publishedFieldId = publishedFields[i]._id.toString();
				for (let j = 0; j < bau.incidents.length; j++)
				{
					const currentIncident = bau.incidents[j];
					for (let k = 0; k < currentIncident.fields.length; k++)
					{
						const currentFieldId = currentIncident.fields[k].fieldId;
						const value = currentIncident.fields[k].value;
						if (currentFieldId == publishedFieldId && value)
						{
							completedFieldCount++;
						}
					}
				}
			}

			return completedFieldCount;
		});
	}

	/**
	 * Returns all published incident fields that contribute to building health in a single array
	 * @return Promise
	 */
	getPublishedIncidentFields()
	{
		const incidentDao = new IncidentDao();
		return incidentDao.loadPublished().then(incidents => {
			let publishedFields = [];
			for (let i = 0; i < incidents.length; i++)
			{
				const currentIncident = incidents[i];
				const fields = currentIncident.fields;
				for (let j = 0; j < fields.length; j++)
				{
					const currentField = fields[j];
					if (currentField.type.contributesToHealth)
					{
						publishedFields.push(currentField);
					}
				}
			}

			return publishedFields;
		});
	}

	getContactHealth(buildingId, agencyId)
	{
		const numberOfRequiredContacts = this.getRequiredNumberOfContacts();
		const numberOfAssignedContacts = this.getNumberOfAssignedContacts(buildingId, agencyId);

		return Promise.all([numberOfRequiredContacts, numberOfAssignedContacts]).then(values => {
			const required = values[0];
			const assigned = values[1];

			let contactHealth = 0.0;
			if (required > 0)
			{
				//Together, all contact data makes up 50% of building health
				contactHealth = (assigned / required) * .5;
			}

			return contactHealth;
		});
	}

	getRequiredNumberOfContacts()
	{
		const incidentDao = new IncidentDao();
		return incidentDao.loadPublished().then(incidents => {
			//Magic number - Two contacts are required per incident
			return incidents.length * 2;
		});
	}

	getNumberOfAssignedContacts(buildingId, agencyId)
	{
		const buildingAgencyDao = new BuildingAgencyDao();
		return buildingAgencyDao.loadOne(buildingId, agencyId).then(bau => {
			let numberOfAssignedContacts = 0;

			const incidents = bau.incidents;
			for (let i = 0; i < incidents.length; i++)
			{
				const currentIncident = incidents[i];
				let currentNumberAssigned = 0;
				for (let j = 0; j < currentIncident.contacts.length; j++)
				{
					const currentContact = currentIncident.contacts[j];
					const now = +new Date() / 1000;
					const lastEditedSeconds = Number(currentContact.lastEdited) / 1000;
					const expirationDateSeconds = lastEditedSeconds + this.contactExpirationSeconds;
					if (expirationDateSeconds > now && currentNumberAssigned < 2)
					{
						currentNumberAssigned++;
					}
				}

				numberOfAssignedContacts += currentNumberAssigned;
			}

			return numberOfAssignedContacts;
		});
	}

	/**
	 * Updates the health of multiple building-agency units
	 * @param BuildingAgency[] buildingAgencies
	 * @return Promise
	 */
	updateMultiple(buildingAgencies)
	{
		let promises = [];
		for (let i = 0; i < buildingAgencies.length; i++)
		{
			const bau = buildingAgencies[i];
			const promise = this.updateHealth(bau.buildingId, bau.agencyId);
			promises.push(promise);
		}

		return Promise.all(promises);
	}

	/**
	 * Updates the health for the buildings in the given agency
	 * @param string agencyId
	 * @return Promise
	 */
	updateBuildingsInAgency(agencyId)
	{
		const agencyObjectId = mongoose.Types.ObjectId(agencyId);
		return BuildingAgency.find({agencyId: agencyObjectId}).then(buildingAgencies => {
			return this.updateMultiple(buildingAgencies);
		});
	}

	/**
	 * Updates the health of all building-agency units
	 */
	updateAll()
	{
		return BuildingAgency.find({}).exec().then(buildingAgencies => {
			return this.updateMultiple(buildingAgencies);
		});
	}
}

module.exports = BuildingAgencyHealthDao;
