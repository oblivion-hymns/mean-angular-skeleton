const IncidentFieldDao = require('./../models/incident-field-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class IncidentFieldController
{
	loadFieldTypes(req, res)
	{
		const incidentFieldDao = new IncidentFieldDao();
		incidentFieldDao.loadFieldTypes().then(types => {
			return new Response(res, 200, '', {types: types});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', config.app.messages.default);
		});
	}

	addField(req, res)
	{
		const incidentId = req.body.incidentId;
		const field = req.body.field;
		const incidentFieldDao = new IncidentFieldDao();
		incidentFieldDao.addField(incidentId, field).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}

	saveField(req, res)
	{
		const field = req.body.field;
		const incidentFieldDao = new IncidentFieldDao();
		incidentFieldDao.saveField(field).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}

	removeField(req, res)
	{
		const incidentId = req.body.incidentId;
		const field = req.body.field;
		const incidentFieldDao = new IncidentFieldDao();
		incidentFieldDao.removeField(incidentId, field).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}

	reorderField(req, res)
	{
		const incidentId = req.body.incidentId;
		const fieldId = req.body.fieldId;
		const order = req.body.order;
		const incidentFieldDao = new IncidentFieldDao();
		incidentFieldDao.reorderField(incidentId, fieldId, order).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', {success: false});
		});
	}
}

module.exports = IncidentFieldController;
