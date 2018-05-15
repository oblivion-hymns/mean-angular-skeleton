const router = require('express').Router();
const IncidentController = require('./controllers/incident-controller');
const IncidentFieldController = require('./controllers/incident-field-controller');
const hasPermission = require('./../auth/middleware/has-permission');

const incidentController = new IncidentController();
const incidentFieldController = new IncidentFieldController();

router.get('/:id', hasPermission('incident_viewOne'), incidentController.loadOne);
router.get('/published', hasPermission('incident_viewPublished'), incidentController.loadPublished);
router.get('/all', hasPermission('incident_viewAll'), incidentController.loadAll);
router.post('/save', hasPermission('incident_save'), incidentController.save);
router.post('/publish', hasPermission('incident_save'), incidentController.publish);
router.post('/archive', hasPermission('incident_archive'), incidentController.archive);

router.get('/types', hasPermission('incident_save'), incidentFieldController.loadFieldTypes);
router.post('/add-field', hasPermission('incident_save'), incidentFieldController.addField);
router.post('/save-field', hasPermission('incident_save'), incidentFieldController.saveField);
router.post('/remove-field', hasPermission('incident_save'), incidentFieldController.removeField);
router.post('/reorder-field', hasPermission('incident_save'), incidentFieldController.reorderField);

module.exports = router;
