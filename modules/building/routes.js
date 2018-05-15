const mongoose = require('mongoose');
const router = require('express').Router();

const BuildingDao = require('./models/building-dao');
const Response = require('./../utility/models/response');
const config = require('../../config/config').instance;
const hasPermission = require('./../auth/middleware/has-permission');

/**
 * Base route
 */
router.get('/', function(req, res){
	res.render('index');
});

/**
 * Load a single Building
 */
router.get('/:id', hasPermission('building_viewOne'), function(req, res, next){
	const buildingId = req.params.id;
	const isValid = mongoose.Types.ObjectId.isValid(buildingId);
	if (!isValid)
	{
		return next();
	}

	const buildingDao = new BuildingDao();
	buildingDao.loadOne(buildingId).then(building => {
		return new Response(res, 200, '', building);
	}).catch(error => {
		console.error(error);
		return new Response(res, 500, config.app.messages.default);
	});
});

/**
 * Load all buildings
 */
router.get('/all', hasPermission('building_viewAll'), function(req, res){
	const buildingDao = new BuildingDao();
	buildingDao.loadAll().then(buildings => {
		return new Response(res, 200, '', buildings);
	}).catch(error => {
		console.error(error);
		return new Response(res, 500, config.app.messages.default);
	});
});

/**
 * Load all buildings within the given agency
 */
router.get('/agency', hasPermission('building_viewByAgency'), function(req, res){
	const buildingDao = new BuildingDao();
	buildingDao.loadForAgency(req.query.agencyId).then(buildings => {
		return new Response(res, 200, '', buildings);
	}).catch(error => {
		console.error(error);
		return new Response(res, 500, config.app.messages.default);
	});
});

/**
 * Searches for and returns a single building
 */
router.get('/search', hasPermission('building_search'), function(req, res){
	const query = req.query.query;
	const buildingDao = new BuildingDao();
	buildingDao.search(query).then(building => {
		return new Response(res, 200, '', building);
	}).catch(error => {
		console.error(error);
		return new Response(res, 500, config.app.messages.default);
	});
});

module.exports = router;
