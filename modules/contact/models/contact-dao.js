const mongoose = require('mongoose');
const BuildingAgencyHealthDao = require('./../../building-agency/models/building-agency-health-dao');
const Contact = require('./contact');

class ContactDao
{
	/**
	 * Returns a single contact
	 * @param string id
	 * @return Promise
	 */
	loadOne(id)
	{
		return Contact.findById(id).exec();
	}

	/**
	 * Returns a list of all contacts for a given agency
	 * @param string agencyId
	 * @return Promise
	 */
	loadForAgency(agencyId)
	{
		const agencyObjectId = mongoose.Types.ObjectId(agencyId);
		return Contact.find({agency: agencyObjectId}).sort('name').exec();
	}

	/**
	 * Saves/updates the given Contact and all of its info
	 * @param Contact contact
	 * @return Promise
	 */
	save(contact)
	{
		let name = contact.name || '';
		name = name.trim();
		let email = contact.email || '';
		email = email.trim();
		let phones = contact.phones || [];
		if (!name.length)
		{
			throw 'Contact must have a name';
		}

		const phoneNumbers = this.getValidPhones(phones);
		if (!phoneNumbers.length)
		{
			throw 'Contact must have at least one phone number';
		}

		for (let i = 0; i < phoneNumbers.length; i++)
		{
			const currentPhone = phoneNumbers[i];
			if (currentPhone.phoneNumber.length < 10)
			{
				throw 'Phone numbers must be 10 digits long';
			}
		}

		const agencyId = contact.agencyId || contact.agency;
		if (!agencyId)
		{
			throw 'Contact must be assigned to an agency';
		}

		const lastEdited = +new Date();
		const notes = contact.notes || '';

		let savePromise = null;
		let id = contact._id || contact.id;
		if (id)
		{
			//Contact already exists
			const contactObjectId = mongoose.Types.ObjectId(id);
			const findQuery = {_id: contactObjectId};
			const updateQuery = {$set: {
				agency: agencyId,
				name: name,
				email: email,
				phones: phoneNumbers,
				notes: notes,
				lastEdited: lastEdited
			}};
			const options = {upsert: true};
			savePromise = Contact.findOneAndUpdate(findQuery, updateQuery, options).exec();
		}
		else
		{
			const newContact = new Contact({
				agency: agencyId,
				name: name,
				email: email,
				phones: phoneNumbers,
				notes: notes,
				lastEdited: lastEdited
			});
			savePromise = newContact.save();
		}

		return savePromise.then(() => {
			const buildingAgencyHealthDao = new BuildingAgencyHealthDao();
			return buildingAgencyHealthDao.updateBuildingsInAgency(agencyId);
		}).then(() => {
			console.log('Done with promises');
		});
	}

	/**
	 * Deletes the given Contact
	 * @param string contactId
	 * @return Promise
	 */
	deleteContact(contactId)
	{
		const contactObjectId = mongoose.Types.ObjectId(contactId);
		return Contact.remove({_id: contactObjectId}).exec();
	}

	/**
	 * Given a list of phone numbers, returns an array of only the valid ones
	 * @param PhoneNumber phones
	 * @return Promise
	 */
	getValidPhones(phones)
	{
		let phoneNumbers = [];
		for (let i = 0; i < phones.length; i++)
		{
			const currentPhone = phones[i];
			let phoneNumber = currentPhone.phoneNumber || '';
			phoneNumber = phoneNumber.trim();
			let label = currentPhone.label || '';
			label = label.trim();
			let extension = currentPhone.extension || '';
			extension = extension.trim();

			if (phoneNumber.length > 0 && label.length > 0)
			{
				phoneNumbers.push({
					phoneNumber: phoneNumber,
					label: label,
					extension: extension
				});
			}
		}

		return phoneNumbers;
	}
}

module.exports = ContactDao;
