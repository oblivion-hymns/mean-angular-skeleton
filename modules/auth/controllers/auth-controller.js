const Response = require('./../../utility/models/response');
const TokenSigner = require('./../models/token-signer');
const TokenVerifier = require('./../models/token-verifier');
const UserPasswordDao = require('./../../user/models/user-password-dao');
const config = require('./../../../config/config').instance;

class AuthController
{
	login(req, res)
	{
		const email = req.body.email;
		const password = req.body.password;
		const userPasswordDao = new UserPasswordDao();

		userPasswordDao.isLoginValid(email, password).then(userId => {
			if (!userId || userId == false)
			{
				return new Response(res, 400, 'Invalid username or password');
			}

			const tokenSigner = new TokenSigner();
			const token = tokenSigner.sign(userId);
			return new Response(res, 200, '', {token: token});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	isTokenValid(req, res)
	{
		const tokenVerifier = new TokenVerifier();
		const token = tokenVerifier.getTokenFromRequest(req);
		const isTokenValid = tokenVerifier.isValid(token);

		if (isTokenValid)
		{
			return new Response(res, 200, '');
		}

		return new Response(res, 401, config.app.messages.unauthorized);
	}
}

module.exports = AuthController;
