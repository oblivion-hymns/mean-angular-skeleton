const mongoose = require('mongoose');
const BuildingAgencyDao = require('./../../building-agency/models/building-agency-dao');
const Response = require('./../../utility/models/response');
const RoleDao = require('./../models/role-dao');
const TokenParser = require('./../models/token-parser');
const TokenVerifier = require('./../models/token-verifier');
const config = require('./../../../config/config').instance;

function isBuildingAgencyRep()
{
	return function(req, res, next){
		//Validate token before proceeding
		const tokenVerifier = new TokenVerifier();
		const token = tokenVerifier.getTokenFromRequest(req);
		if (!tokenVerifier.isValid(token))
		{
			return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
		}

		const agencyId = req.params.agencyId || req.body.agencyId || req.query.agencyId;
		const isAgencyIdValid = mongoose.Types.ObjectId.isValid(agencyId);
		if (!isAgencyIdValid)
		{
			//This will advance to the method as if you were authorized. Methods must verify that any given IDs are
			//valid as well and allow fall-through to the next possible method as necessary
			//return next();
			return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
		}

		const buildingId = req.params.buildingId || req.body.buildingId || req.query.buildingId;
		const isBuildingIdValid = mongoose.Types.ObjectId.isValid(buildingId);
		if (!isBuildingIdValid)
		{
			//This will advance to the method as if you were authorized. Methods must verify that any given IDs are
			//valid as well and allow fall-through to the next possible method as necessary
			//return next();
			return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
		}

		const tokenParser = new TokenParser();
		const userId = tokenParser.getUserIdFromToken(token);

		//Sysadmin override
		const buildingAgencyDao = new BuildingAgencyDao();
		return buildingAgencyDao.loadOne(buildingId, agencyId).then(buildingAgency => {
			if (!buildingAgency || !buildingAgency.reps)
			{
				return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
			}

			//Determine if the user in the token is a rep for the given building-agency.
			let found = false;
			const reps = buildingAgency.reps || [];
			for (let i = 0; i < reps.length; i++)
			{
				if (reps[i]._id.toString() == userId)
				{
					found = true;
					break;
				}
			}

			return found;
		}).then(canProceed => {
			if (!canProceed)
			{
				//Sysadmin override
				const roleDao = new RoleDao();
				return roleDao.hasRole(userId, 'Sysadmin');
			}

			return canProceed;
		}).then(canProceed => {
			if (canProceed)
			{
				return next();
			}

			return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	};
}

module.exports = isBuildingAgencyRep;
