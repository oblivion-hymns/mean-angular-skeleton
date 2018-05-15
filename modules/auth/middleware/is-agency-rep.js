const mongoose = require('mongoose');
const config = require('./../../../config/config').instance;
const AgencyDao = require('./../../agency/models/agency-dao');
const Response = require('./../../utility/models/response');
const RoleDao = require('./../models/role-dao');
const TokenParser = require('./../models/token-parser');
const TokenVerifier = require('./../models/token-verifier');

function isAgencyRep()
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
			return next();
		}

		const tokenParser = new TokenParser();
		const userId = tokenParser.getUserIdFromToken(token);

		const agencyDao = new AgencyDao();
		agencyDao.loadOne(agencyId).then(agencyData => {
			const agency = agencyData.agency;
			if (!agency || !agency.reps)
			{
				return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
			}

			let found = false;
			for (let i = 0; i < agency.reps.length; i++)
			{
				if (agency.reps[i]._id.toString() == userId)
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

module.exports = isAgencyRep;
