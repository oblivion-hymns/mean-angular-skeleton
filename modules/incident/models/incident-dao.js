const mongoose = require('mongoose');
const Incident = require('./incident');
const MailDispatcher = require('./../../communication/models/mail/mail-dispatcher');
const RoleDao = require('./../../auth/models/role-dao');

class IncidentDao
{
	getPopulateOptions()
	{
		const populate = [{
			path: 'fields',
			model: 'IncidentField',
			populate: {
				path: 'type',
				model: 'IncidentFieldType'
			}
		}];
		return populate;
	}

	/**
	 * Returns a single incident, or false if it doesn't exist
	 * @param string id
	 * @return Promise
	 */
	loadOne(id)
	{
		const populate = this.getPopulateOptions();
		return Incident.findOne({_id: id}).populate(populate).exec();
	}

	/**
	 * Loads all incidents that have been published
	 * @return Promise
	 */
	loadPublished()
	{
		const populate = this.getPopulateOptions();
		return Incident.find({published: true, active: true}).sort('name').populate(populate).exec();
	}

	/**
	 * Returns a list of all incidents
	 * @return Promise
	 */
	loadAll()
	{
		const populate = this.getPopulateOptions();
		return Incident.find({active: true}).sort('name').populate(populate).exec();
	}

	/**
	 * Saves the given incident
	 * @param Incident incident
	 * @return Promise
	 */
	save(incident)
	{
		//Can't save an inactive incident
		if (incident.active === false)
		{
			return;
		}

		incident.active = true;

		//If incident is new, assign an ID
		if (!incident._id)
		{
			//Incident is new
			incident._id = new mongoose.mongo.ObjectID();
		}

		//Trim properties
		incident.name = incident.name.trim();
		if (incident.description)
		{
			incident.description = incident.description.trim();
		}

		if (!incident.published)
		{
			incident.published = false;
		}

		if (!incident.fields || !incident.fields.length)
		{
			incident.fields = [];
		}
		else
		{
			for (let i = 0; i < incident.fields.length; i++)
			{
				incident.fields[i] = incident.fields[i]._id || incident.fields[i].id;
			}
		}

		return Incident.findOneAndUpdate({_id: incident._id}, incident, {upsert: true}).exec();
	}

	/**
	 * Publishes the incident. This means that Building Reps are now allowed to fill out
	 * this incident's form
	 * @param string incidentId
	 * @return Promise
	 */
	publish(incidentId)
	{
		return this.loadOne(incidentId).then(incident => {
			incident.published = true;
			return incident.save().then(() => {
				const mailDispatcher = new MailDispatcher();
				const roleDao = new RoleDao();
				roleDao.loadBuildingRepRole().then(role => {
					const args = {incidentName: incident.name};
					mailDispatcher.sendEmailToRole(role, 'Emergency Plan Required', 'incident/publish', args);
				});

				this.updateBuildingAgencyHealth();
			});
		});
	}

	/**
	 * Archives the given incident, rendering it un-viewable and un-usuable by all end-users
	 * @param string incidentId
	 * @return Promise
	 */
	archive(incidentId)
	{
		const query = {'_id': incidentId};
		const promise = Incident.findOne(query).exec().then(incident => {
			const timestamp = + new Date();
			let newName = incident.name + ' (Archived on ' + timestamp + ')';
			const update = {
				$set: {
					active: false,
					name: newName
				}
			};
			return Incident.findOneAndUpdate(query, update).exec().then(() => {
				this.updateBuildingAgencyHealth();
			});
		});

		return promise;
	}

	/**
	 * Updates the health of all building-agency units
	 */
	updateBuildingAgencyHealth()
	{
		const BuildingAgencyHealthDao = require('./../../building-agency/models/building-agency-health-dao');
		const buildingAgencyHealthDao = new BuildingAgencyHealthDao();
		buildingAgencyHealthDao.updateAll();
	}
}

module.exports = IncidentDao;
