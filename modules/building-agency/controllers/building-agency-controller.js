const mongoose = require('mongoose');

const BuildingAgencyDao = require('./../models/building-agency-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class BuildingAgencyController
{
	loadOne(req, res, next)
	{
		const agencyId = req.params.agencyId;
		const isAgencyValid = mongoose.Types.ObjectId.isValid(agencyId);
		if (!isAgencyValid)
		{
			return next();
		}

		const buildingId = req.params.buildingId;
		const isBuildingValid = mongoose.Types.ObjectId.isValid(buildingId);
		if (!isBuildingValid)
		{
			return next();
		}

		const buildingAgencyDao = new BuildingAgencyDao();
		buildingAgencyDao.loadOne(buildingId, agencyId).then(bau => {
			return new Response(res, 200, '', bau);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadForLoggedInUser(req, res)
	{
		const buildingAgencyDao = new BuildingAgencyDao();
		buildingAgencyDao.loadForLoggedInUser(req).then(baus => {
			return new Response(res, 200, '', {buildingAgencyUnits: baus});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadForRep(req, res)
	{
		const userId = req.params.id;
		const buildingAgencyDao = new BuildingAgencyDao();
		buildingAgencyDao.loadForRep(userId).then(baus => {
			return new Response(res, 200, '', {buildingAgencyUnits: baus});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	assignRep(req, res)
	{
		const agencyId = req.body.agencyId || null;
		const buildingId = req.body.buildingId || null;
		const userId = req.body.userId || null;
		if (!agencyId)
		{
			return new Response(res, 400, 'Must provide an agency ID');
		}
		else if (!buildingId)
		{
			return new Response(res, 400, 'Must provide a building ID');
		}
		else if (!userId)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}

		const buildingAgencyDao = new BuildingAgencyDao();
		buildingAgencyDao.assignRep(buildingId, agencyId, userId).then(() => {
			return new Response(res, 200, 'Rep assigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	removeRep(req, res)
	{
		const agencyId = req.query.agencyId || null;
		const buildingId = req.query.buildingId || null;
		const userId = req.query.userId || null;
		if (!agencyId)
		{
			return new Response(res, 400, 'Must provide an agency ID');
		}
		else if (!buildingId)
		{
			return new Response(res, 400, 'Must provide a building ID');
		}
		else if (!userId)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}

		const buildingAgencyDao = new BuildingAgencyDao();
		buildingAgencyDao.unassignRep(buildingId, agencyId, userId).then(() => {
			return new Response(res, 200, 'Rep unassigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	getHealth(req, res)
	{
		const agencyId = req.params.agencyId;
		const buildingId = req.params.buildingId;
		const buildingAgencyDao = new BuildingAgencyDao();
		buildingAgencyDao.getHealth(buildingId, agencyId).then(health => {
			return new Response(res, 200, '', {health: health});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = BuildingAgencyController;
