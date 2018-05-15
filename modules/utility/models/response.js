/**
 * Wrapper for response objects to help make code more concise
 */
class Response
{
	/**
	 * @param ServerResponse response - Original response object
	 * @param number statusCode - An HTTP status code
	 * @param string message
	 * @param any args - Optional. Arguments to include in the response
	 */
	constructor(response, statusCode, message, args)
	{
		this.response = response;
		this.statusCode = statusCode;
		this.message = message;
		this.args = args || {};

		return this.send();
	}

	/**
	 * Constructs & returns a ServerResponse object
	 * @return ServerResponse
	 */
	send()
	{
		var message = this.message;
		var response = this.response;
		var statusCode = this.statusCode;

		var data = this.args;
		if (message)
		{
			data.message = message;
		}

		return response.status(statusCode).json(data);
	}
}

module.exports = Response;
