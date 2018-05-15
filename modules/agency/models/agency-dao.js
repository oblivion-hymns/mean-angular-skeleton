const mongoose = require('mongoose');
const Agency = require('./agency');
const ApiService = require('./../../api/models/api-service');
const MailDispatcher = require('./../../communication/models/mail/mail-dispatcher');
const RoleDao = require('./../../auth/models/role-dao');
const User = require('./../../user/models/user');
const UserDao = require('./../../user/models/user-dao');

/**
 * Database access associated with agencies
 */
class AgencyDao
{
	/**
	 * Given a response data object, merges its mercury and sequoia agencies
	 * together into one object
	 * @param any data
	 * @param boolean mercuryOnly - Only returns agencies with Mercury entries
	 * @return any
	 */
	mergeAgencyData(data, mercuryOnly)
	{
		const seqAgencies = data[0].agencies;
		const merAgencies = data[1];

		let agencyData = {agencies: []};
		for (let i = 0; i < seqAgencies.length; i++)
		{
			const seqAgency = seqAgencies[i];
			let agency = seqAgency;
			for (let j = 0; j < merAgencies.length; j++)
			{
				const merAgency = merAgencies[j];
				if (merAgency.sequoiaId.toString() == seqAgency.id.toString())
				{
					agency.primaryRep = merAgency.primaryRep;
					agency.reps = merAgency.reps || [];
					if (mercuryOnly)
					{
						agencyData.agencies.push(agency);
					}
					break;
				}
			}

			if (!mercuryOnly)
			{
				agencyData.agencies.push(agency);
			}
		}

		return agencyData;
	}

	/**
	 * Loads a single agency with the given ID
	 * @param string id - The Sequoia ID of the agency
	 * @return Promise
	 */
	loadOne(id)
	{
		const apiService = new ApiService();
		const promise = apiService.apiGet('/agency/' + id).then(agency => {
			const agencyId = agency.agency.id;
			const query = {sequoiaId: agencyId};
			const seqPromise = Agency.findOne(query).populate('reps').populate('primaryRep').exec()
				.then(mercuryAgency => {
					if (mercuryAgency)
					{
						agency.agency.reps = mercuryAgency.reps;
						agency.agency.primaryRep = mercuryAgency.primaryRep;
					}
					else
					{
						agency.agency.reps = [];
						agency.agency.primaryRep = null;
					}

					return agency;
				});

			return seqPromise;
		});
		return promise;
	}

	/**
	 * Returns a list of all agencies to which the requesting user is assigned
	 * @param string agencyRepId
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
	 * Returns a list of agencies for which the given user is a regular agency rep
	 * @param string userId
	 * @return Promise
	 */
	loadForRep(userId)
	{
		const userObjectId = mongoose.Types.ObjectId(userId);
		const query = {reps: userObjectId};
		const sequoiaPromise = this.loadAll();
		const mercuryPromise = Agency.find(query).populate('reps').populate('primaryRep').sort('name').exec()
			.then(merAgencies => {
				return merAgencies || [];
			});

		const joinPromise = Promise.all([sequoiaPromise, mercuryPromise]).then(data => {
			let agencyData = this.mergeAgencyData(data, true);
			return agencyData;
		});

		return joinPromise;
	}

	/**
	 * Returns a list of agencies for which the given user is a primary agency rep
	 * @param string userId
	 * @return Promise
	 */
	loadForPrimaryRep(userId)
	{
		const userObjectId = mongoose.Types.ObjectId(userId);
		const query = {primaryRep: userObjectId};
		const sequoiaPromise = this.loadAll();
		const mercuryPromise = Agency.find(query).populate('reps').populate('primaryRep').sort('name').exec()
			.then(merAgencies => {
				return merAgencies || [];
			});

		const joinPromise = Promise.all([sequoiaPromise, mercuryPromise]).then(data => {
			let agencyData = this.mergeAgencyData(data, true);
			return agencyData;
		});

		return joinPromise;
	}

	/**
	 * Returns a list of all agencies
	 * @return Promise
	 */
	loadAll()
	{
		const apiService = new ApiService();
		const sequoiaPromise = apiService.apiGet('/agency/all', {include: 'legacy'});
		const mercuryPromise = Agency.find({}).populate('reps').populate('primaryRep').sort('name').exec()
			.then(mercuryAgencies => {
				return mercuryAgencies || [];
			});


		const joinPromise = Promise.all([sequoiaPromise, mercuryPromise]).then(data => {
			let agencyData = this.mergeAgencyData(data);
			return agencyData;
		});

		return joinPromise;
	}

	/**
	 * Assigns a rep to the given agency
	 * @param string agencyId
	 * @param string userId
	 * @return Promise
	 */
	assignRep(agencyId, userId)
	{
		const roleDao = new RoleDao();
		const userObjectId = mongoose.Types.ObjectId(userId);

		const promise = roleDao.loadAgencyRepRole().then(role => {
			const userQuery = {'_id': userObjectId};
			const userUpdate = {$addToSet: {roles: role}};
			return User.findOneAndUpdate(userQuery, userUpdate, {upsert: true}).exec();
		}).then(() => {
			const update = {$set: {sequoiaId: agencyId}, $addToSet: {reps: userObjectId}};
			return Agency.findOneAndUpdate({sequoiaId: agencyId}, update, {upsert: true}).exec();
		}).then(() => {
			return this.sendAgencyRepEmail(agencyId, userId);
		});

		return promise;
	}

	/**
	 * Removes a rep from the given agency
	 * @param string agencyId
	 * @param string userId
	 * @return Promise
	 */
	unassignRep(agencyId, userId)
	{
		const roleDao = new RoleDao();
		const userObjectId = mongoose.Types.ObjectId(userId);
		const update = {$set: {sequoiaId: agencyId}, $pull: {reps: userObjectId}};
		const promise = Agency.findOneAndUpdate({sequoiaId: agencyId}, update, {upsert: true}).exec();
		promise.then(() => {
			const rolePromise = roleDao.loadAgencyRepRole();
			const agenciesPromise = this.loadForRep(userId);
			return Promise.all([rolePromise, agenciesPromise]);
		}).then(data => {
			//If the user has no agencies assigned, automatically relinquish them
			//of their Agency Rep role
			const role = data[0];
			const agencies = data[1].agencies;
			if (!agencies || agencies.length == 0)
			{
				const userQuery = {'_id': userObjectId};
				const userUpdate = {$pull: {roles: mongoose.Types.ObjectId(role._id)}};
				return User.findOneAndUpdate(userQuery, userUpdate, {multi: true}).exec();
			}
		});

		return promise;
	}

	/**
	 * Assigns the primary rep for the given agency. A primary agency rep cannot be JUST unassigned;
	 * they must be replaced.
	 * @param string agencyId
	 * @param string userId
	 * @return Promise
	 */
	assignPrimaryRep(agencyId, userId)
	{
		const query = {sequoiaId: agencyId};
		const promise = Agency.findOne(query).populate('primaryRep').exec().then(agency => {
			if (!agency)
			{
				agency = {
					sequoiaId: agencyId,
					primaryRep: null,
					reps: []
				};
			}

			//Unassign the current primary rep from the regular reps
			const currentPrimaryRep = agency.primaryRep;
			if (currentPrimaryRep)
			{
				this.unassignRep(agencyId, currentPrimaryRep._id);
			}

			//Update primary rep
			const userObjectId = mongoose.Types.ObjectId(userId);
			const update = {$set: {sequoiaId: agencyId, primaryRep: userObjectId}};
			const updatePromise = Agency.findOneAndUpdate(query, update, {upsert: true}).exec();

			//Assign as a normal rep in addition to the primary rep
			const assignPromise = this.assignRep(agencyId, userId);
			return Promise.all([updatePromise, assignPromise]);
		});

		return promise;
	}

	/**
	 * Sends the agency rep assignment email to the given user at the given agency
	 * @param string agencyId
	 * @param string userId
	 * @return Promise
	 */
	sendAgencyRepEmail(agencyId, userId)
	{
		const agencyDao = new AgencyDao();
		const userDao = new UserDao();
		const agencyPromise = agencyDao.loadOne(agencyId);
		const userPromise = userDao.loadOne(userId);
		return Promise.all([agencyPromise, userPromise]).then(data => {
			const agency = data[0];
			const user = data[1];
			const to = [user.email];
			const args = {
				name: user.firstName,
				agencyName: agency.agency.name
			};

			const mailDispatcher = new MailDispatcher();
			return mailDispatcher.sendEmailWithTemplate(to, 'Assigned as Agency Rep', 'assign/agency-rep', args);
		});
	}
}

module.exports = AgencyDao;
