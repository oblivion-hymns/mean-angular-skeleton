const TokenVerifier = require('./../models/token-verifier');

/**
 * Determines if the user making the request is currently logged in.
 * Will progress to the next router function if authorized; otherwise the request is rejected
 * @return Response
 */
function isLoggedIn(req, res, next)
{
	const pathWhitelist = [
		'/',
		'/auth/has-permission',
		'/home',
		'/home/login',
		'/home/create-account',
		'/auth/login',
		'/auth/is-token-valid',
		'/user',
		'/user/create',
		'/reset-password',
		'/user/reset-password',
		'/user/update-password'
	];
	let path = req.originalUrl;

	if (path.indexOf('?') > -1)
	{
		path = path.substring(0, path.indexOf('?')); //Remove params, if any
	}

	if (pathWhitelist.indexOf(path) > -1)
	{
		next();
		return;
	}

	const tokenVerifier = new TokenVerifier();
	const token = tokenVerifier.getTokenFromRequest(req);
	const isTokenValid = tokenVerifier.isValid(token);
	if (!isTokenValid)
	{
		return res.render('unauthorized');
	}

	if (req.query.token)
	{
		//Strip the token from the query string and put it in the headers instead
		res.header('Authorization', 'Bearer ' + token);
	}

	next();
}

module.exports = isLoggedIn;
