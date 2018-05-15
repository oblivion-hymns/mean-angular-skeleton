const bcrypt = require('bcryptjs');

const MailDispatcher = require('./../../communication/models/mail/mail-dispatcher');
const PasswordManager = require('./password-manager');
const TokenGenerator = require('./../../auth/models/token-generator');
const User = require('./user');
const config = require('./../../../config/config').instance;

class UserPasswordDao
{
	/**
	 * Resets the password for the given e-mail
	 * @param string emailAddress
	 * @return Promise
	 */
	resetPassword(emailAddress)
	{
		const tokenGenerator = new TokenGenerator();
		const newToken = tokenGenerator.generateToken();
		const promise = User.findOne({email: emailAddress}).then(user => {
			if (!user)
			{
				return null;
			}

			const now = new Date() / 1000;
			const expirationTime = now + config.app.passwordResetExpiration;
			user.passwordReset = {
				token: newToken,
				expirationTime: expirationTime
			};

			return user.save();
		}).then(user => {
			if (!user)
			{
				return null;
			}

			const appUrl = config.app.url + ':' + config.app.port + '/reset-password?resetToken=' + newToken;
			const mailDispatcher = new MailDispatcher();
			mailDispatcher.sendEmailWithTemplate([user.email], 'Reset Password', 'user/reset-password', {url: appUrl});
		});
		return promise;
	}

	/**
	 * Attempts to find a user for the given token and update their password
	 * @param string token
	 * @param string password - Raw password string. Do not pass in a hashed password, this method does that for you
	 * @return Promise
	 */
	updatePassword(token, password)
	{
		const query = {'passwordReset.token': token};
		const promise = User.findOne(query).then(user => {
			if (!user)
			{
				throw new Error('Something went wrong. Try submitting a new password reset request.');
			}

			const expirationTime = user.passwordReset.expirationTime;
			const now = new Date() / 1000;
			if (expirationTime == 0)
			{
				throw new Error('Your password reset link has already been used.');
			}
			else if (now >= expirationTime)
			{
				throw new Error('Your password reset link has expired. Submit a new password reset request.');
			}

			const passwordManager = new PasswordManager();
			const hashedPassword = passwordManager.encrypt(password);
			user.password = hashedPassword;
			user.passwordReset.expirationTime = 0;
			return user.save();
		});
		return promise;
	}

	/**
	 * Determines whether the given password is valid for the given email.
	 * Returns a Promise containing either the user ID or false
	 * @param string email
	 * @param string password - Hashed
	 * @return Promise
	 */
	isLoginValid(email, password)
	{
		email = email || '';
		email = email.trim().toLowerCase();
		return User.findOne({email: email}).exec().then(user => {
			if (!user)
			{
				return false;
			}

			const isPasswordValid = bcrypt.compareSync(password, user.password);
			if (isPasswordValid)
			{
				return user._id;
			}

			return false;
		});
	}
}

module.exports = UserPasswordDao;
