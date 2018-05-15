const NotificationDao = require('./../models/notification-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class NotificationController
{
	notifyRole(req, res)
	{
		const roleId = req.body.roleId;
		if (!roleId)
		{
			return new Response(res, 400, '', 'Must select a role');
		}

		let subject = req.body.subject || '';
		subject = subject.trim();
		if (!subject)
		{
			return new Response(res, 400, '', 'Must provide a subject');
		}

		let body = req.body.body || '';
		body = body.trim();
		if (!body)
		{
			return new Response(res, 400, '', 'Must provide a body');
		}

		const notificationDao = new NotificationDao();
		notificationDao.notifyRole(roleId, subject, body).then(() => {
			return new Response(res, 200, '');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = NotificationController;
