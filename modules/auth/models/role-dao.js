const mongoose = require('mongoose');
const Role = require('./role');
const User = require('./../../user/models/user');

class RoleDao
{
	/**
	 * Loads a single role by ID
	 * @param string id
	 * @return Promise
	 */
	loadOne(id)
	{
		return Role.findOne({_id: id}).populate('permissions').exec();
	}

	/**
	 * Returns the role with the given name, if one exists
	 * @param string roleName
	 * @return Promise
	 */
	loadByName(roleName)
	{
		return Role.findOne({name: roleName}).populate('permissions').exec();
	}

	/**
	 * Returns the Agency Rep role
	 * @return Promise
	 */
	loadAgencyRepRole()
	{
		return this.loadByName('Agency Rep');
	}

	/**
	 * Returns the Building Rep role
	 * @return Promise
	 */
	loadBuildingRepRole()
	{
		return this.loadByName('Building Rep');
	}

	/**
	 * Returns the State Police role
	 * @return Promise
	 */
	loadStatePoliceRole()
	{
		return this.loadByName('State Police');
	}

	/**
	 * Returns the default "User" role
	 * @return Promise
	 */
	loadUserRole()
	{
		return this.loadByName('User');
	}

	/**
	 * Returns only roles assignable by OSGS users
	 */
	loadOSGSRoles()
	{
		return Role.find({osgsAssignable: true}).sort('name').populate('permissions').exec();
	}

	/**
	 * Returns a list of all Roles
	 * @return Promise
	 */
	loadAll()
	{
		return Role.find({}).sort('name').populate('permissions').exec();
	}

	/**
	 * Determines whether the given role is an OSGS-assignable role
	 * @param string roleId
	 * @return Promise
	 */
	isRoleOSGSAssignable(roleId)
	{
		return this.loadOne(roleId).then(role => {
			return role.osgsAssignable || false;
		});
	}

	/**
	 * Assigns the given role to the given user
	 * @param string userId
	 * @param string roleId
	 * @return Promise
	 */
	assignRole(userId, roleId)
	{
		const id = mongoose.Types.ObjectId(userId);
		const update = {$addToSet: {roles: roleId}};
		const promise = User.findByIdAndUpdate(id, update).exec();
		return promise;
	}

	/**
	 * Removes the given role from the given user
	 * @param string userId
	 * @param string roleId
	 * @return Promise
	 */
	unassignRole(userId, roleId)
	{
		const id = mongoose.Types.ObjectId(userId);
		const update = {$pull: {roles: roleId}};
		const promise = User.findByIdAndUpdate(id, update).exec();
		return promise;
	}

	/**
	 * Assigns the given permission to the given role
	 * @param string roleId
	 * @param string permissionId
	 * @return Promise
	 */
	assignPermission(roleId, permissionId)
	{
		const roleObjectId = mongoose.Types.ObjectId(roleId);
		const permissionObjectId = mongoose.Types.ObjectId(permissionId);
		const update = {$addToSet: {permissions: permissionObjectId}};
		const promise = Role.findByIdAndUpdate(roleObjectId, update).exec();
		return promise;
	}

	/**
	 * Removes the given permission from the given role
	 * @param string roleId
	 * @param string permissionId
	 * @return Promise
	 */
	unassignPermission(roleId, permissionId)
	{
		const roleObjectId = mongoose.Types.ObjectId(roleId);
		const permissionObjectId = mongoose.Types.ObjectId(permissionId);
		const update = {$pull: {permissions: permissionObjectId}};
		const promise = Role.findByIdAndUpdate(roleObjectId, update).exec();
		return promise;
	}

	/**
	 * Determines whether or not the User with the given ID has the given role
	 * @param string userId
	 * @param string roleName
	 * @return Promise
	 */
	hasRole(userId, roleName)
	{
		userId = userId || null;
		roleName = roleName || null;

		const promise = this.loadByName(roleName).then(role => {
			if (!role)
			{
				return false;
			}

			return User.findOne({_id: userId, roles: role}).exec();
		}).then(user => {
			return !!user;
		});

		return promise;
	}
}

module.exports = RoleDao;
