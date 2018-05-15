const MailDispatcher = require('./mail/mail-dispatcher');
const RoleDao = require('./../../auth/models/role-dao');

class NotificationDao
{
	/**
	 * Sends an e-mail with the given subject and body to all users in the given role
	 * @param string roleId
	 * @param string subject
	 * @param string body
	 * @return Promise
	 */
	notifyRole(roleId, subject, body)
	{
		const roleDao = new RoleDao();
		return roleDao.loadOne(roleId).then(role => {
			if (!role)
			{
				throw 'Must provide a valid role';
			}

			const mailDispatcher = new MailDispatcher();
			const args = {body: body};
			return mailDispatcher.sendEmailToRole(role, subject, 'notifications/generic', args);
		});
	}
}

module.exports = NotificationDao;
