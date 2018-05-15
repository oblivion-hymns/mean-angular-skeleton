const config = require('./../../../config/config').instance;
const Response = require('./../../utility/models/response');
const UserPasswordDao = require('./../models/user-password-dao');
const UserValidator = require('./../models/user-validator');

class UserPasswordController
{
	resetPassword(req, res)
	{
		if (!req.body.email)
		{
			return new Response(res, 400, 'You must enter an e-mail address.');
		}

		const emailAddress = req.body.email.trim().toLowerCase();
		const userPasswordDao = new UserPasswordDao();
		userPasswordDao.resetPassword(emailAddress).then(() => {
			return new Response(res, 200, '', {success: true});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	updatePassword(req, res)
	{
		if (!req.body.resetToken)
		{
			let msg = 'Something went wrong. Please try requesting to reset your password again.';
			return new Response(res, 400, msg);
		}

		if (!req.body.password)
		{
			let msg = 'You must enter a password.';
			return new Response(res, 400, msg);
		}

		if (!req.body.passwordConfirm)
		{
			let msg = 'You must enter your password twice.';
			return new Response(res, 400, msg);
		}

		if (req.body.password != req.body.passwordConfirm)
		{
			let msg = 'Passwords do not match. Re-enter your password and try again.';
			return new Response(res, 400, msg);
		}

		const token = req.body.resetToken;
		const password = req.body.password;

		//Validate password
		const userValidator = new UserValidator();
		if (!userValidator.isPasswordValid(password))
		{
			var message = 'Password must be 8 or more characters long ';
			message += 'and contain at least one capital letter, one number, and one symbol.';
			return new Response(res, 400, message);
		}

		const userPasswordDao = new UserPasswordDao();
		userPasswordDao.updatePassword(token, password).then(() => {
			return new Response(res, 200, 'Password reset successfully. Try logging in using your new password.');
		}).catch(error => {
			return new Response(res, 500, error.message, {});
		});
	}
}

module.exports = UserPasswordController;
