const Response = require('./../../utility/models/response');
const RoleDao = require('./../models/role-dao');
const config = require('./../../../config/config').instance;

class RoleController
{
	loadAll(req, res)
	{
		const roleDao = new RoleDao();
		roleDao.loadAll().then(roles => {
			return new Response(res, 200, '', {roles: roles});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	assignRole(req, res)
	{
		const userToAssign = req.body.userId || null;
		const roleToAssign = req.body.roleId || null;
		if (!userToAssign)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}
		else if (!roleToAssign)
		{
			return new Response(res, 400, 'Must provide a role');
		}

		const roleDao = new RoleDao();
		roleDao.assignRole(userToAssign, roleToAssign).then(() => {
			return new Response(res, 200, 'Role assigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	unassignRole(req, res)
	{
		const userToAssign = req.query.userId || null;
		const roleToAssign = req.query.roleId || null;
		if (!userToAssign)
		{
			return new Response(res, 400, 'Must provide a user ID');
		}
		else if (!roleToAssign)
		{
			return new Response(res, 400, 'Must provide a role');
		}

		const roleDao = new RoleDao();
		roleDao.loadOne(roleToAssign).then(role => {
			if (!role || !role.isRemovable)
			{
				throw 'This role does not exist or is not removable';
			}
			else
			{
				return roleDao.unassignRole(userToAssign, roleToAssign);
			}

		}).then(() => {
			return new Response(res, 200, 'Role unassigned successfully');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = RoleController;
