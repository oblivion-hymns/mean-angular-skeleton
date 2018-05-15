const mongoose = require('mongoose');
const ContactDao = require('./../models/contact-dao');
const Response = require('./../../utility/models/response');
const config = require('./../../../config/config').instance;

class ContactController
{
	loadOne(req, res, next)
	{
		const contactId = req.params.id;
		const isContactIdValid = mongoose.Types.ObjectId.isValid(contactId);
		if (!isContactIdValid)
		{
			return next();
		}

		const contactDao = new ContactDao();
		contactDao.loadOne(contactId).then(contact => {
			return new Response(res, 200, '', {contact: contact});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	loadForAgency(req, res)
	{
		const agencyId = req.params.agencyId;
		const isAgencyIdValid = mongoose.Types.ObjectId.isValid(agencyId);
		if (!isAgencyIdValid)
		{
			return new Response(res, 404, 'The agency you requested was not found');
		}

		const contactDao = new ContactDao();
		contactDao.loadForAgency(agencyId).then(contacts => {
			return new Response(res, 200, '', {contacts: contacts});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}

	save(req, res)
	{
		const contact = req.body.contact;
		const contactDao = new ContactDao();
		contactDao.save(contact).then(() => {
			console.log('Sending response');
			return new Response(res, 200, '');
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, error);
		});
	}

	deleteContact(req, res)
	{
		const contactId = req.params.id;
		const isContactIdValid = mongoose.Types.ObjectId.isValid(contactId);
		if (!isContactIdValid)
		{
			return new Response(res, 404, 'The contact you requested was not found');
		}

		const contactDao = new ContactDao();
		contactDao.loadOne(contactId).then(contact => {
			return new Response(res, 200, '', {contact: contact});
		}).catch(error => {
			console.error(error);
			return new Response(res, 500, config.app.messages.default);
		});
	}
}

module.exports = ContactController;
