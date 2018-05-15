const IncidentDao = require('./../models/incident-dao');
const IncidentValidator = require('./../models/incident-validator');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;
const mongoose = require('mongoose');

class IncidentController
{
	loadOne(req, res, next)
	{
		const incidentId = req.params.id;
		const isValid = mongoose.Types.ObjectId.isValid(incidentId);
		if (!isValid)
		{
			return next();
		}

		const incidentDao = new IncidentDao();
		incidentDao.loadOne(incidentId).then(incident => {
			return new Response(res, 200, '', {incident: incident});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', config.app.messages.default);
		});
	}

	loadPublished(req, res)
	{
		const incidentDao = new IncidentDao();
		incidentDao.loadPublished().then(incidents => {
			return new Response(res, 200, '', {incidents: incidents});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', config.app.messages.default);
		});
	}

	loadAll(req, res)
	{
		const incidentDao = new IncidentDao();
		incidentDao.loadAll().then(incidents => {
			return new Response(res, 200, '', {incidents: incidents});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', config.app.messages.default);
		});
	}

	save(req, res)
	{
		var incident = req.body.incident;
		const incidentValidator = new IncidentValidator();

		try
		{
			incidentValidator.validate(incident);
		}
		catch (error)
		{
			return new Response(res, 500, '', {errorMessage: error});
		}

		//null is a valid ID - so delete the field if it exists as null
		if (!incident.id)
		{
			delete incident.id;
		}
		else
		{
			incident._id = incident.id;
			delete incident.id;
		}

		const incidentDao = new IncidentDao();
		incidentDao.save(incident).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}

	publish(req, res)
	{
		const incidentId = req.body.incidentId;
		const incidentDao = new IncidentDao();
		incidentDao.publish(incidentId).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}

	archive(req, res)
	{
		const incidentId = req.body.incidentId;
		const incidentDao = new IncidentDao();
		incidentDao.archive(incidentId).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}
}

module.exports = IncidentController;
