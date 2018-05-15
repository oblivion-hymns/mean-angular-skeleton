const PermissionDao = require('./../models/permission-dao');
const Response = require('./../../utility/models/response');
const TokenParser = require('./../models/token-parser');
const TokenVerifier = require('./../models/token-verifier');
const config = require('./../../../config/config').instance;

/**
 * Determines if the route is accessible by the currently-logged-in user based on their permissions.
 * Will progress to the next router function if authorized; otherwise the request is rejected
 * @param string permissionName - The name of the permission to check against
 * @return Response
 */
function hasPermission(permissionName)
{
	return function(req, res, next){
		//Validate token before proceeding
		const tokenParser = new TokenParser();
		const tokenVerifier = new TokenVerifier();
		const token = tokenVerifier.getTokenFromRequest(req);

		//Determine if the user in the token has the given permission
		const permissionDao = new PermissionDao();
		const userId = tokenParser.getUserIdFromToken(token);

		permissionDao.hasPermission(userId, permissionName).then(isAuthorized => {
			if (isAuthorized)
			{
				next();
				return;
			}

			return res.render('unauthorized', {status: 401, message: config.app.messages.unauthorized});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	};
}

module.exports = hasPermission;
