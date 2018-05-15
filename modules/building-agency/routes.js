const router = require('express').Router();
const hasPermission = require('./../auth/middleware/has-permission');
const isAgencyRep = require('./../auth/middleware/is-agency-rep');
const isBuildingAgencyRep = require('./../auth/middleware/is-building-agency-rep');

const BuildingAgencyController = require('./controllers/building-agency-controller');
const BuildingAgencyContactController = require('./controllers/building-agency-contact-controller');
const BuildingAgencyIncidentController = require('./controllers/building-agency-incident-controller');

//BAU-specific actions
const buildingAgencyController = new BuildingAgencyController();
router.get('/logged-in-user', hasPermission('buildingRep_viewBuildings'), buildingAgencyController.loadForLoggedInUser);
router.get('/rep/:id', hasPermission('buildingRep_viewBuildingsForRep'), buildingAgencyController.loadForRep);
router.get('/:agencyId/:buildingId', hasPermission('building_viewOne'), buildingAgencyController.loadOne);
router.post('/assign-rep', isAgencyRep(), buildingAgencyController.assignRep);
router.delete('/assign-rep', isAgencyRep(), buildingAgencyController.removeRep);
router.get('/health/:agencyId/:buildingId', hasPermission('building_viewOne'), buildingAgencyController.getHealth);

//BAU-Incident actions
const bauIncidentController = new BuildingAgencyIncidentController();
router.post('/save-incident-data', isBuildingAgencyRep(), bauIncidentController.saveIncidentData);

//BAU-Incident-Contact actions
const bauContactController = new BuildingAgencyContactController();
router.put('/contacts', isBuildingAgencyRep(), bauContactController.addContactToIncident);
router.post('/contacts/delete', isBuildingAgencyRep(), bauContactController.removeContactFromIncident);

module.exports = router;
