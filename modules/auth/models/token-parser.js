const jwt = require('jsonwebtoken');

class TokenParser
{
	/**
	 * Returns the user ID associated with a given JSON Web Token.
	 * @param string token - A JWT web token
	 * @return string
	 */
	getUserIdFromToken(token)
	{
		const decodedToken = jwt.decode(token);
		if (decodedToken)
		{
			return decodedToken.userId;
		}

		return null;
	}
}

module.exports = TokenParser;
