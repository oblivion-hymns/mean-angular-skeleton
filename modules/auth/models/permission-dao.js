const Permission = require('./permission');
const User = require('./../../user/models/user');

class PermissionDao
{
	/**
	 * Returns the permission with the given name, if one exists
	 * @param string permissionName
	 * @return Promise
	 */
	loadByName(permissionName)
	{
		return Permission.findOne({name: permissionName}).exec();
	}

	/**
	 * Returns a list of all permissions
	 * @return Promise
	 */
	loadAll()
	{
		return Permission.find({}).sort('name').exec();
	}

	/**
	 * Determines whether or not the User with the given ID has the given permission
	 * @param string userId
	 * @param string permissionName
	 * @return Promise
	 */
	hasPermission(userId, permissionName)
	{
		const promise = this.loadByName(permissionName).then(permission => {
			if (!permission)
			{
				return false;
			}

			const populate = {
				path: 'roles',
				model: 'Role',
				populate: {
					path: 'permissions',
					model: 'Permission'
				}
			};

			return User.findOne({_id: userId}).populate(populate).exec().then(user => {
				var found = false;

				if (user.roles)
				{
					for (let i = 0; i < user.roles.length; i++)
					{
						const role = user.roles[i];
						if (role.permissions)
						{
							for (let j = 0; j < role.permissions.length; j++)
							{
								const currentPermission = role.permissions[j];
								if (currentPermission.name == permissionName)
								{
									found = true;
									break;
								}
							}
						}

						if (found)
						{
							break;
						}
					}
				}

				return found;
			});
		});

		return promise;
	}
}

module.exports = PermissionDao;
