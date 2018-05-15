const PermissionDao = require('./../models/permission-dao');
const Response = require('./../../utility/models/response');
const RoleDao = require('./../models/role-dao');
const TokenParser = require('./../models/token-parser');
const TokenVerifier = require('./../models/token-verifier');
const config = require('./../../../config/config').instance;

class PermissionController
{
	loadAll(req, res)
	{
		const permissionDao = new PermissionDao();
		permissionDao.loadAll().then(permissions => {
			return new Response(res, 200, '', {permissions: permissions});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	assignPermission(req, res)
	{
		const roleId = req.body.roleId || null;
		const permissionId = req.body.permissionId || null;
		if (!roleId)
		{
			return new Response(res, 400, 'Must provide a role ID');
		}
		else if (!permissionId)
		{
			return new Response(res, 400, 'Must provide a permission ID');
		}

		const roleDao = new RoleDao();
		roleDao.assignPermission(roleId, permissionId).then(() => {
			return new Response(res, 200, 'Permission assigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	unassignPermission(req, res)
	{
		const roleId = req.query.roleId || null;
		const permissionId = req.query.permissionId || null;
		if (!roleId)
		{
			return new Response(res, 400, 'Must provide a role ID');
		}
		else if (!permissionId)
		{
			return new Response(res, 400, 'Must provide a permission ID');
		}

		const roleDao = new RoleDao();
		roleDao.unassignPermission(roleId, permissionId).then(() => {
			return new Response(res, 200, 'Permission unassigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	hasPermission(req, res)
	{
		const tokenParser = new TokenParser();
		const tokenVerifier = new TokenVerifier();

		const token = tokenVerifier.getTokenFromRequest(req);
		const userId = tokenParser.getUserIdFromToken(token);
		const permission = req.query.permission;
		if (!userId)
		{
			return new Response(res, 400, '', false);
		}
		else if (!permission)
		{
			return new Response(res, 400, 'Must provide a permission');
		}

		const permissionDao = new PermissionDao();
		permissionDao.hasPermission(userId, permission).then(result => {
			return new Response(res, 200, '', {hasPermission: result});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = PermissionController;
