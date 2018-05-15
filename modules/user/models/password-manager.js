const bcrypt = require('bcryptjs');

class PasswordManager
{
	/**
	 * Returns an encrypted version of the given plaintext password string
	 * @param string password
	 * @return string
	 */
	encrypt(password)
	{
		return bcrypt.hashSync(password, 10);
	}
}

module.exports = PasswordManager;
