const router = require('express').Router();
const HelpController = require('./controllers/help-controller');
const hasPermission = require('./../auth/middleware/has-permission');

const helpController = new HelpController();
router.get('/:identifier', hasPermission('help_load'), helpController.load);
router.post('/', hasPermission('help_save'), helpController.save);

module.exports = router;
