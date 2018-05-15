const jwt = require('jsonwebtoken');

/**
 * In charge of verifying JSON web tokens
 */
class TokenVerifier
{
	/**
	 * Returns the token from the given request
	 * @param Request req
	 * @return string
	 */
	getTokenFromRequest(req)
	{
		const authHeader = req.get('Authorization');
		const token = this.getTokenFromAuthHeader(authHeader) || req.query.token || '';
		return token;
	}

	/**
	 * Returns a token based on a given authorization header ("Bearer ...")
	 * @param string authHeader - The "Authorization" header string from an HTTP request
	 * @return string
	 */
	getTokenFromAuthHeader(authHeader)
	{
		if (!authHeader)
		{
			return '';
		}

		const token = authHeader.replace('Bearer ', '');
		return token;
	}

	/**
	 * Returns true if the given token is valid, false if it is not
	 * @param string token
	 * @return boolean
	 */
	isValid(token)
	{
		try
		{
			jwt.verify(token, 'secret');
		}
		catch (e)
		{
			return false;
		}

		return true;
	}
}

module.exports = TokenVerifier;
