const router = require('express').Router();

const AuthController = require('./controllers/auth-controller');
const PermissionController = require('./controllers/permission-controller');
const RoleController = require('./controllers/role-controller');
const OSGSRoleController = require('./controllers/osgs-role-controller');

const hasPermission = require('./middleware/has-permission');

const authController = new AuthController();
const roleController = new RoleController();
const permController = new PermissionController();
const osgsController = new OSGSRoleController();

router.post('/login', authController.login);
router.get('/is-token-valid', authController.isTokenValid);

router.get('/all-roles', hasPermission('sysadmin_allRoles'), roleController.loadAll);
router.post('/assign-role', hasPermission('sysadmin_assignRole'), roleController.assignRole);
router.delete('/assign-role', hasPermission('sysadmin_removeRole'), roleController.unassignRole);

router.get('/osgs-roles', hasPermission('osgsAdmin_viewRoles'), osgsController.loadAll);
router.post('/osgs-assign-role', hasPermission('osgsAdmin_assignRoles'), osgsController.assignRole);
router.delete('/osgs-assign-role', hasPermission('osgsAdmin_removeRoles'), osgsController.unassignRole);

router.get('/all-permissions', hasPermission('sysadmin_allPermissions'), permController.loadAll);
router.post('/assign-permission', hasPermission('sysadmin_assignPermission'), permController.assignPermission);
router.delete('/assign-permission', hasPermission('sysadmin_removePermission'), permController.unassignPermission);
router.get('/has-permission', permController.hasPermission);

module.exports = router;
