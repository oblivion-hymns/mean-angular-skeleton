const AgencyDao = require('./../models/agency-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;
const mongoose = require('mongoose');

class AgencyController
{
	baseRoute(req, res)
	{
		return res.render('index');
	}

	loadOne(req, res, next)
	{
		const agencyId = req.params.id;
		const isValid = mongoose.Types.ObjectId.isValid(agencyId);
		if (!isValid)
		{
			return next();
		}

		const agencyDao = new AgencyDao();
		agencyDao.loadOne(agencyId).then(agency => {
			return new Response(res, 200, '', agency);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadForLoggedInUser(req, res)
	{
		const agencyDao = new AgencyDao();
		agencyDao.loadForLoggedInUser(req).then(agencies => {
			return new Response(res, 200, '', agencies);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadForRep(req, res)
	{
		const userId = req.params.id;
		const agencyDao = new AgencyDao();
		agencyDao.loadForRep(userId).then(agencies => {
			return new Response(res, 200, '', agencies);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadForPrimaryRep(req, res)
	{
		const userId = req.params.id;
		const agencyDao = new AgencyDao();
		agencyDao.loadForPrimaryRep(userId).then(agencies => {
			return new Response(res, 200, '', agencies);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadAll(req, res)
	{
		const agencyDao = new AgencyDao();
		agencyDao.loadAll().then(agencies => {
			return new Response(res, 200, '', agencies);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	assignRep(req, res)
	{
		const agencyToAssign = req.body.agencyId || null;
		const userToAssign = req.body.userId || null;
		if (!agencyToAssign)
		{
			return new Response(res, 400, 'Must provide an agency ID');
		}
		else if (!userToAssign)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}

		const agencyDao = new AgencyDao();
		agencyDao.assignRep(agencyToAssign, userToAssign).then(() => {
			return new Response(res, 200, 'Rep assigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	removeRep(req, res)
	{
		const agencyToAssign = req.query.agencyId || null;
		const userToAssign = req.query.userId || null;
		if (!agencyToAssign)
		{
			return new Response(res, 400, 'Must provide an agency ID');
		}
		else if (!userToAssign)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}

		const agencyDao = new AgencyDao();
		agencyDao.unassignRep(agencyToAssign, userToAssign).then(() => {
			return new Response(res, 200, 'Rep unassigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	assignPrimaryRep(req, res)
	{
		const agencyToAssign = req.body.agencyId || null;
		const userToAssign = req.body.userId || null;
		if (!agencyToAssign)
		{
			return new Response(res, 400, 'Must provide an agency ID');
		}
		else if (!userToAssign)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}

		const agencyDao = new AgencyDao();
		agencyDao.assignPrimaryRep(agencyToAssign, userToAssign).then(() => {
			return new Response(res, 200, 'Rep assigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = AgencyController;
