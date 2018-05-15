const AgencyDao = require('./../../agency/models/agency-dao');
const BuildingAgencyDao = require('./../../building-agency/models/building-agency-dao');
const DomainWhitelistDao = require('./../../communication/models/mail/domain-whitelist-dao');
const MailDispatcher = require('./../../communication/models/mail/mail-dispatcher');
const PasswordManager = require('./../models/password-manager');
const Response = require('./../../utility/models/response');
const RoleDao = require('./../../auth/models/role-dao');
const User = require('./../models/user');
const UserDao = require('./../models/user-dao');
const UserValidator = require('./../models/user-validator');
const config = require('./../../../config/config').instance;

class UserController
{
	search(req, res)
	{
		const query = req.query.query || '';
		if (!query)
		{
			return new Response(res, 400, 'Must provide a search query');
		}

		const userDao = new UserDao();
		userDao.search(query).then(users => {
			return new Response(res, 200, '', {users: users});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadPage(req, res)
	{
		const page = req.params.page;
		const pageSize = req.params.pageSize;
		const userDao = new UserDao();
		userDao.loadPage(page, pageSize).then(userData => {
			return new Response(res, 200, '', userData);
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadByRole(req, res)
	{
		const userDao = new UserDao();
		userDao.loadByRole(req.query.roleId).then(users => {
			return new Response(res, 200, '', {users: users});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadFromRequest(req, res)
	{
		const userDao = new UserDao();
		userDao.loadFromRequest(req).then(user => {
			return new Response(res, 200, '', {user: user});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, '', config.app.messages.default);
		});
	}

	loadAll(req, res)
	{
		const userDao = new UserDao();
		userDao.loadAll().then(users => {
			return new Response(res, 200, '', {users: users});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	create(req, res)
	{
		const userDao = new UserDao();

		var firstName = req.body.firstName || null;
		var lastName = req.body.lastName || null;
		if (!firstName || !lastName)
		{
			return new Response(res, 400, 'Must provide a first and last name');
		}

		firstName = firstName.trim();
		lastName = lastName.trim();

		var email = req.body.email || null;
		if (!email)
		{
			return new Response(res, 400, 'Must provide an e-mail address');
		}

		email = email.trim().toLowerCase();

		var password = req.body.password || null;
		var passwordConfirm = req.body.passwordConfirm || null;

		const domainWhitelistDao = new DomainWhitelistDao();
		domainWhitelistDao.isOnWhitelist(email).then(isWhitelisted => {
			//Check domain whitelist for e-mail address
			if (!isWhitelisted)
			{
				let msg = 'This e-mail address is not authorized for registration. ';
				msg += 'If you believe you are seeing this message in error, ';
				msg += 'contact the Office of State Government Security.';
				throw msg;
			}
		}).then(() => {
			//Validation
			if (!password || !passwordConfirm)
			{
				return new Response(res, 400, 'Must provide a password');
			}

			if (password != passwordConfirm)
			{
				return new Response(res, 400, 'Passwords do not match. Try typing them again');
			}

			//Validation
			const userValidator = new UserValidator();
			if (!userValidator.isNameValid(firstName, lastName))
			{
				return new Response(res, 400, 'Must provide a valid first and last name');
			}

			if (!userValidator.isEmailValid(email))
			{
				return new Response(res, 400, 'Must provide a valid e-mail');
			}

			if (!userValidator.isPasswordValid(password))
			{
				var message = 'Password must be 8 or more characters long ';
				message += 'and contain at least one capital letter, one number, and one symbol.';
				return new Response(res, 400, message);
			}

			const roleDao = new RoleDao();
			const userPromise = roleDao.loadUserRole();
			const statePolicePromise = roleDao.loadStatePoliceRole();
			return Promise.all([userPromise, statePolicePromise]);
		}).then(roleData => {
			const userRole = roleData[0];
			const statePoliceRole = roleData[1];

			let roles = [userRole];
			if (email.match(/lpp[0-9]{4,5}@gw\.njsp\.org/g))
			{
				roles.push(statePoliceRole);
			}

			//Create & save user
			const passwordManager = new PasswordManager();
			const user = new User({
				firstName: firstName,
				lastName: lastName,
				email: email,
				password: passwordManager.encrypt(password),
				roles: roles
			});

			return userDao.save(user).catch(() => {
				throw 'A user with that e-mail address already exists';
			});
		}).then(() => {
			//Send account creation email
			const mailDispatcher = new MailDispatcher();
			mailDispatcher.sendEmailWithTemplate(email, 'Account created', 'user/create-account', {name: firstName});
			return new Response(res, 200, 'User saved successfully');
		}).catch(error => {
			return new Response(res, 400, error);
		});
	}

	deleteUser(req, res)
	{
		const userId = req.params.id;
		const agencyDao = new AgencyDao();
		const buildingAgencyDao = new BuildingAgencyDao();
		const agencyPromise = agencyDao.loadForRep(userId);
		const buildingAgencyPromise = buildingAgencyDao.loadForRep(userId);

		Promise.all([agencyPromise, buildingAgencyPromise]).then(data => {
			const agencies = data[0].agencies;
			const buildingAgencies = data[1];

			if (agencies.length > 0 || buildingAgencies.length > 0)
			{
				let message = 'This user is attached to one or more Agencies or Buildings as a rep. ';
				message += 'OSGS must unassign this user before they can be deleted.';
				return new Response(res, 400, message);
			}
			else
			{
				const userDao = new UserDao();
				userDao.deleteUser(userId).then(() => {
					return new Response(res, 200, config.app.messages.default);
				}).catch(error => {
					console.error(error);
					return new Response(res, 500, config.app.messages.default);
				});
			}
		});
	}
}

module.exports = UserController;
