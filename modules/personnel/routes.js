const mongoose = require('mongoose');
const router = require('express').Router();

const PersonnelDao = require('./models/personnel-dao');
const Response = require('./../utility/models/response');
const config = require('../../config/config').instance;
const hasPermission = require('./../auth/middleware/has-permission');

/**
 * Load a single personnel
 */
router.get('/:id', hasPermission('personnel_viewOne'), function(req, res, next){
	const personnelId = req.params.id;
	const isValid = mongoose.Types.ObjectId.isValid(personnelId);
	if (!isValid)
	{
		return next();
	}

	const personnelDao = new PersonnelDao();
	personnelDao.loadOne(personnelId).then(personnel => {
		return new Response(res, 200, '', personnel);
	}).catch(error => {
		console.error(error);
		return new Response(res, 500, config.app.messages.default);
	});
});

/**
 * Load all personnel in the given building
 */
router.get('/building', hasPermission('personnel_viewByBuilding'), function(req, res, next){
	const buildingId = req.query.buildingId;
	const isValid = mongoose.Types.ObjectId.isValid(buildingId);
	if (!isValid)
	{
		return next();
	}

	const floor = req.query.floor;
	const personnelDao = new PersonnelDao();
	var callback = null;
	if (floor)
	{
		callback = personnelDao.loadForBuildingAndFloor(buildingId, floor);
	}
	else
	{
		callback = personnelDao.loadForBuilding(buildingId);
	}

	callback.then(personnel => {
		return new Response(res, 200, '', {personnel: personnel});
	}).catch(error => {
		console.error(error);
		return new Response(res, 500, config.app.messages.default);
	});
});

module.exports = router;
