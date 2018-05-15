const nodemailer = require('nodemailer');
const nodemailerSmtp = require('nodemailer-smtp-transport');

const TemplateParser = require('./template-parser');
const UserDao = require('./../../../user/models/user-dao');
const config = require('./../../../../config/config').instance;

class MailDispatcher
{
	/**
	 * Sends an e-mail
	 * @param string[] to - An array of emails to send the message to
	 * @param string subject
	 * @param string body
	 * @param string[] cc - Optional. An array of emails to copy the message to
	 * @param string bcc - Optional. An array of emails to blind copy the message to
	 */
	sendEmail(to, subject, body, cc, bcc)
	{
		if (!config.mail.enabled)
		{
			return;
			//throw new Error('E-mail is currently disabled. Enable e-mail in the config to call this method');
		}

		to = to || [];
		cc = cc || [];
		bcc = bcc || [];

		/*if (to.length == 0)
		{
			throw new Error('Must include at least one "to" address');
		}*/

		if (subject)
		{
			subject = subject.trim();
		}

		//Separate blocks to check after the trim if a string exists
		if (!subject)
		{
			throw new Error('Must include a subject');
		}

		if (body)
		{
			body = body.trim();
		}

		//Separate blocks to check after the trim if a string exists
		if (!body)
		{
			throw new Error('Must include a body');
		}

		const from = config.mail.defaultFrom;
		const redirect = config.mail.redirect;
		if (redirect)
		{
			to = config.mail.redirectEmails;
			cc = [];
			bcc = [];
		}

		const smtpConfig = config.mail.smtp;
		const transporter = nodemailer.createTransport(nodemailerSmtp(smtpConfig));
		const mailOptions = {
			from: from,
			to: to.join(', '),
			cc: cc.join(', '),
			bcc: bcc.join(', '),
			subject: subject,
			html: body
		};
		transporter.sendMail(mailOptions, error => {
			if (error)
			{
				console.error(error);
			}
		});
	}

	/**
	 * Sends an e-mail using a predefined template
	 * @param string[] to - An array of emails to send the message to
	 * @param string subject
	 * @param string templateName - Name of the html template. Will be resolved to a template path
	 * @param any args - Key/value arguments to be passed to the template
	 * @param string[] cc - Optional. An array of emails to copy the message to
	 * @param string bcc - Optional. An array of emails to blind copy the message to
	 * @return Promise
	 */
	sendEmailWithTemplate(to, subject, templateName, args, cc, bcc)
	{
		if (templateName)
		{
			templateName = templateName.trim();
		}

		if (!templateName)
		{
			throw new Error('Must include a template name');
		}

		const templateParser = new TemplateParser();
		templateParser.parse(templateName, args).then(html => {
			this.sendEmail(to, subject, html, cc, bcc);
		}).catch(error => {
			if (config.mail.enabled)
			{
				console.error(error);
			}
		});
	}

	/**
	 * Sends an e-mail to every user with the given role
	 * @param Role role
	 * @param string subject
	 * @param string templateName - Name of the html template. Will be resolved to a template path
	 * @param any args - Key/value arguments to be passed to the template
	 */
	sendEmailToRole(role, subject, templateName, args)
	{
		if (templateName)
		{
			templateName = templateName.trim();
		}

		if (!templateName)
		{
			throw new Error('Must include a template name');
		}

		const userDao = new UserDao();

		if (role)
		{
			userDao.loadByRole(role._id).then(users => {
				let emailAddresses = [];
				for (let i = 0; i < users.length; i++)
				{
					const currentUser = users[i];
					emailAddresses.push(currentUser.email);
				}

				if (emailAddresses.length > 0)
				{
					const templateParser = new TemplateParser();
					templateParser.parse(templateName, args).then(html => {
						this.sendEmail(emailAddresses, subject, html);
					}).catch(error => {
						//Only report mail errors if mail is actually enabled
						if (config.mail.enabled)
						{
							console.error(error);
						}
					});
				}
			});
		}
	}
}

module.exports = MailDispatcher;
