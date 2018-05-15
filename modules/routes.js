const express = require('express');
const router = express.Router();
const hasPermission = require('./auth/middleware/has-permission');

router.get('/reset-password', function(req, res){
	res.render('index');
});

/**
 * Whitelist only Sysadmins for Sysadmin routes
 */
router.get('/sa*', hasPermission('sysadmin_home'), function(req, res){
	res.render('index');
});

/**
 * Whitelist only State Police for State Police routes
 */
router.get('/sp*', hasPermission('statePolice_home'), function(req, res){
	res.render('index');
});

/**
 * Whitelist only Agency Reps for Agency Rep routes
 */
router.get('/ar*', hasPermission('agencyRep_home'), function(req, res){
	res.render('index');
});

/**
 * Whitelist only Building Reps for Building Rep routes
 */
router.get('/br*', hasPermission('buildingRep_home'), function(req, res){
	res.render('index');
});

/**
 * Whitelists all users for User routes
 */
router.get('/user*', hasPermission('user_home'), function(req, res){
	res.render('index');
});

router.get('/', function(req, res){
	res.render('index');
});

module.exports = router;
