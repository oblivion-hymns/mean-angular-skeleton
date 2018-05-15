const router = require('express').Router();
const AgencyController = require('./controllers/agency-controller');
const hasPermission = require('./../auth/middleware/has-permission');

const agencyController = new AgencyController();

router.get('/', agencyController.baseRoute);

//Loading
router.get('/:id', hasPermission('agency_viewOne'), agencyController.loadOne);
router.get('/logged-in-user', hasPermission('agencyRep_viewAgencies'), agencyController.loadForLoggedInUser);
router.get('/rep/:id', hasPermission('agencyRep_viewAgenciesForRep'), agencyController.loadForRep);
router.get('/rep/:id/primary', hasPermission('agencyRep_viewAgenciesForRep'), agencyController.loadForPrimaryRep);
router.get('/all', hasPermission('agency_viewAll'), agencyController.loadAll);

//Assigning reps
router.post('/assign-head-rep', hasPermission('osgs_assignHeadAgencyRep'), agencyController.assignPrimaryRep);
router.post('/assign-rep', hasPermission('agencyRep_assign'), agencyController.assignRep);
router.delete('/assign-rep', hasPermission('agencyRep_remove'), agencyController.removeRep);

module.exports = router;
