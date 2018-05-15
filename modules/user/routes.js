const hasPermission = require('./../auth/middleware/has-permission');
const router = require('express').Router();

//Loading users
const UserController = require('./controllers/user-controller');
const userController = new UserController();

router.get('/search', hasPermission('user_search'), userController.search);
router.get('/page/:page/:pageSize', hasPermission('user_loadPage'), userController.loadPage);
router.get('/role', hasPermission('user_loadByRole'), userController.loadByRole);
router.get('/', userController.loadFromRequest);
router.get('/all', hasPermission('sysadmin_manageUsers'), userController.loadAll);

//Creating & deleting users
router.put('/create', userController.create);
router.delete('/:id', hasPermission('user_delete'), userController.deleteUser);

//Password management
const UserPasswordController = require('./controllers/user-password-controller');
const userPasswordController = new UserPasswordController();

router.post('/reset-password', userPasswordController.resetPassword);
router.post('/update-password', userPasswordController.updatePassword);

module.exports = router;
