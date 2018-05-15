const router = require('express').Router();
const CommunicationController = require('./controllers/communication-controller');
const NotificationController = require('./controllers/notification-controller');
const hasPermission = require('./../auth/middleware/has-permission');

const communicationController = new CommunicationController();
router.get('/whitelist', hasPermission('communication_viewDomainWhitelist'), communicationController.loadAll);
router.put('/whitelist', hasPermission('communication_manageDomainWhitelist'), communicationController.addDomain);
router.patch('/whitelist', hasPermission('communication_manageDomainWhitelist'), communicationController.editDomain);
router.delete('/whitelist', hasPermission('communication_manageDomainWhitelist'), communicationController.removeDomain);

const notificationController = new NotificationController();
router.put('/notify-role', hasPermission('communication_notifyRole'), notificationController.notifyRole);

module.exports = router;
