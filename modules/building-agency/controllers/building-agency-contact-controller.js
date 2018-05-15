const BuildingAgencyContactDao = require('./../models/building-agency-contact-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class BuildingAgencyContactController
{
	addContactToIncident(req, res)
	{
		const buildingId = req.body.buildingId;
		const agencyId = req.body.agencyId;
		const contactId = req.body.contactId;
		const incidentId = req.body.incidentId;

		const bauContactDao = new BuildingAgencyContactDao();
		bauContactDao.addContactToIncident(buildingId, agencyId, incidentId, contactId).then(bau => {
			return new Response(res, 200, '', {health: bau.health});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	removeContactFromIncident(req, res)
	{
		const buildingId = req.body.buildingId;
		const agencyId = req.body.agencyId;
		const contactId = req.body.contactId;
		const incidentId = req.body.incidentId;

		const bauContactDao = new BuildingAgencyContactDao();
		bauContactDao.removeContactFromIncident(buildingId, agencyId, incidentId, contactId).then(bau => {
			return new Response(res, 200, '', {health: bau.health});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = BuildingAgencyContactController;
