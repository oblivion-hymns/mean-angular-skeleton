const mongoose = require('mongoose');
const AgencyDao = require('./../../agency/models/agency-dao');
const BuildingAgency = require('./building-agency');
const BuildingDao = require('./../../building/models/building-dao');
const RoleDao = require('./../../auth/models/role-dao');
const User = require('./../../user/models/user');
const UserDao = require('./../../user/models/user-dao');

class BuildingAgencyDao
{
	getPopulateOptions()
	{
		const populate = [{
			path: 'reps',
			model: 'User'
		}, {
			path: 'incidents.contacts',
			model: 'Contact'
		}];
		return populate;
	}

	/**
	 * Loads a single Building-Agency Unit with the given IDs
	 * @param string buildingId
	 * @param string agencyId
	 * @return Promise
	 */
	loadOne(buildingId, agencyId)
	{
		//Get agency
		const agencyDao = new AgencyDao();
		const agencyPromise = agencyDao.loadOne(agencyId);

		//Get building
		const buildingDao = new BuildingDao();
		const buildingPromise = buildingDao.loadOne(buildingId);

		//Get building-agency unit
		const bauQuery = {buildingId: buildingId, agencyId: agencyId};
		const buildingAgencyPromise = BuildingAgency.findOne(bauQuery).populate(this.getPopulateOptions()).exec();

		//Merge promises
		const joinPromises = [agencyPromise, buildingPromise, buildingAgencyPromise];
		const mergePromise = Promise.all(joinPromises).then(data => {
			const buildingAgency = data[2];

			let health = 0.0;
			let reps = [];
			let incidents = [];
			if (buildingAgency)
			{
				reps = buildingAgency.reps;
				incidents = buildingAgency.incidents;
				health = buildingAgency.health;
			}

			const loadedBuildingAgency = {
				agency: data[0].agency,
				building: data[1].building,
				health: health,
				reps: reps,
				incidents: incidents
			};
			return loadedBuildingAgency;
		});

		return mergePromise;
	}

	/**
	 * Loads all Building-agency units for which the given request's user is a rep
	 * @param Request req
	 * @return Promise
	 */
	loadForLoggedInUser(req)
	{
		const userDao = new UserDao();
		const promise = userDao.loadFromRequest(req).then(user => {
			if (!user)
			{
				return [];
			}

			return this.loadForRep(user.id);
		});

		return promise;
	}

	/**
	 * Loads all building-agency units for which the given user is a rep
	 * @param string userId
	 * @return Promise
	 */
	loadForRep(userId)
	{
		const promise = BuildingAgency.find({reps: userId}).populate(this.getPopulateOptions()).exec().then(baus => {
			let constructPromises = [];
			for (let i = 0; i < baus.length; i++)
			{
				const bau = baus[i];
				const buildingId = bau.buildingId;
				const agencyId = bau.agencyId;
				const bauPromise = this.loadOne(buildingId, agencyId);
				constructPromises.push(bauPromise);
			}

			return Promise.all(constructPromises);
		});
		return promise;
	}

	/**
	 * Assigns a rep to the given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @param string userId
	 * @return Promise
	 */
	assignRep(buildingId, agencyId, userId)
	{
		const roleDao = new RoleDao();
		const userObjectId = mongoose.Types.ObjectId(userId);

		const promise = roleDao.loadBuildingRepRole().then(role => {
			const userQuery = {'_id': userObjectId};
			const userUpdate = {$addToSet: {roles: role}};
			return User.findOneAndUpdate(userQuery, userUpdate, {upsert: true}).exec();
		}).then(() => {
			const query = {buildingId: buildingId, agencyId: agencyId};
			const update = {$addToSet: {reps: userObjectId}};
			return BuildingAgency.findOneAndUpdate(query, update, {upsert: true}).exec();
		}).catch(error => {
			console.error(error);
		});

		return promise;
	}

	/**
	 * Removes a rep from the given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @param string userId
	 * @return Promise
	 */
	unassignRep(buildingId, agencyId, userId)
	{
		const userObjectId = mongoose.Types.ObjectId(userId);
		const query = {buildingId: buildingId, agencyId: agencyId};
		const update = {$pull: {reps: userObjectId}};
		const promise = BuildingAgency.findOneAndUpdate(query, update, {upsert: true}).exec();
		promise.then(() => {
			//Once the BAU has been updated, get the Building Rep role and any buildings
			//still assigned to the user
			const roleDao = new RoleDao();
			const rolePromise = roleDao.loadBuildingRepRole();
			const buildingsPromise = this.loadForRep(userId);
			return Promise.all([rolePromise, buildingsPromise]);
		}).then(data => {
			//If the user has no buildings assigned, automatically relinquish them
			//of their Building Rep role
			const role = data[0];
			const buildingAgencies = data[1];
			if (!buildingAgencies || buildingAgencies.length == 0)
			{
				const userQuery = {'_id': userObjectId};
				const userUpdate = {$pull: {roles: mongoose.Types.ObjectId(role._id)}};
				return User.findOneAndUpdate(userQuery, userUpdate, {multi: true}).exec();
			}
		});

		return promise;
	}

	/**
	 * Returns the health of the given building-agency unit
	 * @param string buildingId
	 * @param string agencyId
	 * @return Promise
	 */
	getHealth(buildingId, agencyId)
	{
		return this.loadOne(buildingId, agencyId).then(bau => {
			return bau.health || 0.0;
		});
	}
}

module.exports = BuildingAgencyDao;
