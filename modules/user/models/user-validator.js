var emailValidator = require('email-validator');

/**
 * Validates aspects of a User object
 */
class UserValidator
{
	/**
	 * Validates a user's first and last name
	 * @param string firstName
	 * @param string lastName
	 * @return boolean
	 */
	isNameValid(firstName, lastName)
	{
		if (!firstName || !lastName)
		{
			return false;
		}

		//Pretty much anything could be a valid name -- basically, just check that there's something there
		const trimmedFirstName = firstName.trim();
		const trimmedLastName = lastName.trim();

		if (!trimmedFirstName || !trimmedLastName)
		{
			return false;
		}

		const regex = /\S{1,}/;
		const validFirstName = regex.test(trimmedFirstName);
		const validLastName = regex.test(trimmedLastName);

		return (validFirstName && validLastName);
	}

	/**
	 * Validates a user's unencrypted password
	 * @param string password
	 * @return boolean
	 */
	isPasswordValid(password)
	{
		if (!password)
		{
			return false;
		}

		const trimmedPassword = password.trim();
		if (!trimmedPassword)
		{
			return false;
		}

		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
		return regex.test(password);
	}

	/**
	 * Validates a user's e-mail address
	 * @param string emailAddress
	 * @return boolean
	 */
	isEmailValid(emailAddress)
	{
		if (!emailAddress)
		{
			return false;
		}

		var trimmedEmail = emailAddress.trim();
		if (!trimmedEmail)
		{
			return false;
		}

		return emailValidator.validate(emailAddress);
	}
}

module.exports = UserValidator;
