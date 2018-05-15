const jwt = require('jsonwebtoken');
const config = require('./../../../config/config').instance;

class TokenSigner
{
	/**
	 * Signs a JSON web token for the given user and returns that token
	 * @param string userId
	 * @return string
	 */
	sign(userId)
	{
		const userData = {userId: userId};
		const secret = 'secret';
		const options = {expiresIn: config.app.tokenExpiration};
		const token = jwt.sign(userData, secret, options);
		return token;
	}
}

module.exports = TokenSigner;
