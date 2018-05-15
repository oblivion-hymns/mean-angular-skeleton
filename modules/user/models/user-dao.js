const TokenParser = require('./../../auth/models/token-parser');
const TokenVerifier = require('./../../auth/models/token-verifier');
const User = require('./user');

/**
 * Database access associated with users
 */
class UserDao
{
	constructor()
	{
		this.includeString = 'firstName lastName email passwordReset roles';
	}

	/**
	 * Loads a single user
	 * @param string id
	 * @return Promise
	 */
	loadOne(id)
	{
		return User.findOne({_id: id}, this.includeString).exec();
	}

	/**
	 * Returns a paginated subset of users, as well as the total number of pages
	 * @param int page - Zero indexed
	 * @param int pageSize - Max 100
	 * @return Promise
	 */
	loadPage(page, pageSize)
	{
		page = parseInt(page);
		pageSize = parseInt(pageSize);

		const findPromise = User.find({}, this.includeString).sort('lastName').skip(page*pageSize).limit(pageSize).populate('roles').exec();
		const countPromise = User.count().exec();
		const promise = Promise.all([findPromise, countPromise]).then(data => {
			const users = data[0];
			const count = data[1];

			return {
				totalPages: Math.ceil(count/pageSize),
				totalUsers: count,
				users: users
			};
		});

		return promise;
	}

	/**
	 * Loads the User with the given email. Returns all fields
	 * @param string email
	 * @return Promise
	 */
	loadByEmail(email)
	{
		email = email || '';
		const trimmedEmail = email.trim().toLowerCase();
		var promise = User.findOne({email: trimmedEmail}, this.includeString, function(error, user){
			return user;
		});
		return promise;
	}

	/**
	 * Returns all users with the given role
	 * @param string roleId
	 * @return Promise
	 */
	loadByRole(roleId)
	{
		return User.find({roles: roleId}, this.includeString).exec();
	}

	/**
	 * Loads and returns the User who made the given request
	 * @param Request req
	 * @return Promise
	 */
	loadFromRequest(req)
	{
		const tokenParser = new TokenParser();
		const tokenVerifier = new TokenVerifier();
		const token = tokenVerifier.getTokenFromAuthHeader(req.get('Authorization'));
		const userId = tokenParser.getUserIdFromToken(token);
		return this.loadOne(userId);
	}

	/**
	 * Loads a list of all users. Does not include passwords
	 * @return Promise
	 */
	loadAll()
	{
		return User.find({}, this.includeString).sort('lastName firstName').populate('roles').exec();
	}

	/**
	 * @param string queryString
	 * @return Promise
	 */
	search(queryString)
	{
		const regex = new RegExp('.*' + queryString + '.*', 'i');
		const options = [{'firstName': {$regex: regex}}, {'lastName': {$regex: regex}}];
		const query = {$or: options};

		return User.find(query, this.includeString).populate('roles').exec();
	}

	/**
	 * Saves the given User and returns its Promise
	 * @param User user
	 * @return Promise
	 */
	save(user)
	{
		return user.save();
	}

	/**
	 * Completely removes the given user from the database
	 * @param string userId
	 * @return Promise
	 */
	deleteUser(userId)
	{
		return User.remove({'_id': userId}).exec();
	}
}

module.exports = UserDao;
