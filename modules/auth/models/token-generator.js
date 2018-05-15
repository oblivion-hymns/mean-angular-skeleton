const uniqid = require('uniqid');

class TokenGenerator
{
	/**
	 * Generates a token for resetting passwords
	 * @return string
	 */
	generateToken()
	{
		return uniqid();
	}
}

module.exports = TokenGenerator;
