const request = require('request');
const queryString = require('query-string');
const config = require('./../../../config/config').instance;

/**
 * Abstracts API access into its own layer.
 * Use for all API calls
 */
class ApiService
{
	constructor()
	{
		this.headers = {
			'Content-Type': 'application/json'
		};
		this.apiPort = config.api.port;
		this.apiToken = config.api.token;
		this.apiUrl = config.api.url;
	}

	/**
	 * Issues a GET request to the API and returns a promise that forwards the response
	 * @param string endpoint - The endpoint to access, e.g. "/building/all"
	 * @param any args - A set of key value pairs to encode in the URL string. Token is automatically included
	 * @return Promise
	 */
	apiGet(endpoint, args)
	{
		args = args || {};
		args.token = this.apiToken;

		const baseUrl = this.apiUrl + ':' + this.apiPort + endpoint;
		const query = queryString.stringify(args, {encode: false});
		const url = baseUrl + '?' + query;
		const options = {headers: this.headers, url: url};

		var promise = new Promise(function(resolve, reject){
			request(options, function(error, response, body){
				if (error)
				{
					reject(error);
					return;
				}

				let responseJson = {};
				try
				{
					responseJson = JSON.parse(body);
				}
				catch (e)
				{
					responseJson = {
						success: false,
						message: 'Error parsing response'
					};
				}

				resolve(responseJson);
			});
		});
		return promise;
	}
}

module.exports = ApiService;
