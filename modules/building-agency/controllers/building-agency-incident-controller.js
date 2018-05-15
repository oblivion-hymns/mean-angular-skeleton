const BuildingAgencyIncidentDao = require('./../models/building-agency-incident-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class BuildingAgencyIncidentController
{
	saveIncidentData(req, res)
	{
		const agencyId = req.body.agencyId || null;
		const buildingId = req.body.buildingId || null;
		const incidentId = req.body.incidentId || null;
		const formData = req.body.formData || [];
		if (!agencyId)
		{
			return new Response(res, 400, 'Must provide an agency ID');
		}
		else if (!buildingId)
		{
			return new Response(res, 400, 'Must provide a building ID');
		}
		else if (!incidentId)
		{
			return new Response(res, 400, 'Must provide an incident ID');
		}

		const buildingAgencyIncidentDao = new BuildingAgencyIncidentDao();
		buildingAgencyIncidentDao.saveIncidentData(buildingId, agencyId, incidentId, formData).then(bau => {
			return new Response(res, 200, 'Emergency Action Plan saved successfully', {health: bau.health});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = BuildingAgencyIncidentController;
