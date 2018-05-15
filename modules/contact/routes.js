const router = require('express').Router();
const ContactController = require('./controllers/contact-controller');
const hasPermission = require('./../auth/middleware/has-permission');

const contactController = new ContactController();
router.post('/', hasPermission('contact_save'), contactController.save);
router.get('/:id', hasPermission('contact_loadOne'), contactController.loadOne);
router.delete('/:id', hasPermission('contact_delete'), contactController.deleteContact);
router.get('/agency/:agencyId', hasPermission('contact_loadForAgency'), contactController.loadForAgency);

module.exports = router;
