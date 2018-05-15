const mongoose = require('mongoose');
const IncidentDao = require('./incident-dao');
const IncidentField = require('./incident-field');
const IncidentFieldType = require('./incident-field-type');

class IncidentFieldDao
{
	/**
	 * Returns the given field
	 * @param string fieldId
	 * @return Promise
	 */
	loadOne(id)
	{
		const fieldObjectId = mongoose.Types.ObjectId(id);
		return IncidentField.findOne({_id: fieldObjectId}).populate('type').exec();
	}

	/**
	 * Returns a list of the fields for the given incident
	 * @param string incidentId
	 * @return Promise
	 */
	loadForIncident(incidentId)
	{
		const incidentObjectId = mongoose.Types.ObjectId(incidentId);
		return IncidentField.find({incident: incidentObjectId}).populate('type').sort('order').exec();
	}

	/**
	 * Returns a list of all field types
	 * @return Promise
	 */
	loadFieldTypes()
	{
		return IncidentFieldType.find({}).sort('name').exec();
	}

	/**
	 * Adds the given field to the given incident
	 * @param string incidentId
	 * @param IncidentField field
	 * @return Promise
	 */
	addField(incidentId, field)
	{
		const incidentDao = new IncidentDao();
		const incidentObjectId = mongoose.Types.ObjectId(incidentId);
		let saveField = new IncidentField(field);
		saveField.incident = incidentObjectId;
		saveField.type = mongoose.Types.ObjectId(field.type.id);
		saveField.identifier = saveField.label.toLowerCase().replace(/\s/g, '_');

		const promise = this.loadForIncident(incidentId).then(fields => {
			//Construct field identifier
			let existingIdentifiers = [];
			for (let i = 0; i < fields.length; i++)
			{
				existingIdentifiers.push(fields[i].identifier);
			}

			while (existingIdentifiers.indexOf(saveField.identifier) > -1)
			{
				saveField.identifier += '_(2)';
			}

			//Update order of existing fields
			const order = saveField.order;
			const findQuery = {incident: incidentObjectId, order: {$gte: order}};
			const updateQuery = {$inc: {order: 1}};
			return IncidentField.updateMany(findQuery, updateQuery);
		}).then(() => {
			//Save field
			return saveField.save();
		}).then(() => {
			//Collect data to update incident field references
			const fieldsPromise = this.loadForIncident(incidentId);
			const incidentPromise = incidentDao.loadOne(incidentObjectId);
			return Promise.all([fieldsPromise, incidentPromise]);
		}).then(data => {
			//Update references on incident
			const fields = data[0];
			const incident = data[1];
			incident.fields = fields;
			return incidentDao.save(incident);
		}).then(() => {
			this.updateBuildingAgencyHealth();
		});

		return promise;
	}

	/**
	 * Saves the given field
	 * @param IncidentField field
	 */
	saveField(field)
	{
		field.identifier = field.label.toLowerCase().replace(/\s/g, '_');

		const promise = this.loadForIncident(field.incident).then(fields => {
			//Construct field identifier
			let existingIdentifiers = [];
			for (let i = 0; i < fields.length; i++)
			{
				existingIdentifiers.push(fields[i].identifier);
			}

			while (existingIdentifiers.indexOf(field.identifier) > -1)
			{
				field.identifier += '_(2)';
			}
		}).then(() => {
			const findQuery = {_id: field.id};
			const updateQuery = {$set:
				{
					properties: field.properties,
					label: field.label,
					identifier: field.identifier
				}
			};
			return IncidentField.update(findQuery, updateQuery);
		}).then(() => {
			this.updateBuildingAgencyHealth();
		});

		return promise;
	}

	/**
	 * Removes the given field from the given incident
	 * @param string incidentId
	 * @param IncidentField field
	 * @return Promise
	 */
	removeField(incidentId, field)
	{
		const incidentDao = new IncidentDao();
		const incidentObjectId = mongoose.Types.ObjectId(incidentId);

		//Update order of existing fields
		const order = field.order;
		const findQuery = {incident: incidentObjectId, order: {$gt: order}};
		const updateQuery = {$inc: {order: -1}};
		const promise = IncidentField.update(findQuery, updateQuery).then(() => {
			//Delete field
			return IncidentField.remove({_id: field.id}).exec();
		}).then(() => {
			//Collect data to update incident field references
			const fieldsPromise = this.loadForIncident(incidentId);
			const incidentPromise = incidentDao.loadOne(incidentObjectId);
			return Promise.all([fieldsPromise, incidentPromise]);
		}).then(data => {
			//Update references on incident
			const fields = data[0];
			const incident = data[1];
			incident.fields = fields;
			return incidentDao.save(incident);
		}).then(() => {
			this.updateBuildingAgencyHealth();
		});

		return promise;
	}

	/**
	 * Moves the given field to the given order within the given incident
	 * @param string incidentId
	 * @param string fieldId
	 * @param number order
	 * @return Promise
	 */
	reorderField(incidentId, fieldId, order)
	{
		const incidentDao = new IncidentDao();
		const incidentObjectId = mongoose.Types.ObjectId(incidentId);

		let oldOrder = null;
		let newOrder = order;

		//Just find the existing field, remove it, and add it back
		const promise = this.loadOne(fieldId).then(field => {
			oldOrder = field.order;

			//Adjust existing orders based on new position of the re-ordered item
			let findQuery = {};
			let updateQuery = {};
			if (newOrder < oldOrder)
			{
				findQuery = {incident: incidentObjectId, order: {$lt: oldOrder, $gte: newOrder}};
				updateQuery = {$inc: {order: 1}};
			}
			else
			{
				findQuery = {incident: incidentObjectId, order: {$gt: oldOrder, $lte: newOrder}};
				updateQuery = {$inc: {order: -1}};
			}

			//Decrement fields above the old position and below the new position
			const promise = IncidentField.updateMany(findQuery, updateQuery).then(() => {
				field.order = newOrder;
				field.save();
			}).then(() => {
				//Collect data to update incident field references
				const fieldsPromise = this.loadForIncident(incidentId);
				const incidentPromise = incidentDao.loadOne(incidentObjectId);
				return Promise.all([fieldsPromise, incidentPromise]);
			}).then(data => {
				//Update references on incident
				const fields = data[0];
				const incident = data[1];
				incident.fields = fields;
				return incidentDao.save(incident);
			});

			return promise;
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

module.exports = IncidentFieldDao;
