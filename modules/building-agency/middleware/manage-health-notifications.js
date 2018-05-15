const Agency = require('./../../agency/models/agency');
const BuildingAgency = require('./../models/building-agency');
const HealthNotification = require('./../models/health-notification');
const MailDispatcher = require('./../../communication/models/mail/mail-dispatcher');

/**
 * Manages health notifications for the application.
 *
 * Essentially, this class will check if a notification needs to be sent
 * to Building & Agency reps for having unhealthy buildings.
 * The business process states that this notification must be sent
 * on January 1st and July 1st of each year. However, we are doing our
 * best to keep this application portable and simple to use -- that is,
 * we should be able to hand off the application with no extra work required
 * by the team we are handing it off to.
 *
 * Normally I would use a CRON job for such a task. However since our goal
 * is to require no documentation or "things to remember" when handing off the
 * code base, we are doing it this way instead.
 *
 * What happens here is on every request made, the server will check
 * if it has sent a notification since the last date it should have.
 * If it has not, it will send the notification and record it.
 * This way the whole process is totally automated and requires no set-up
 * or documentation. As a result, users may not see a notification *exactly*
 * on January 1st; rather it will be sent the _first time someone makes a request
 * after that date_.
 *
 * If you have adopted this code base and want to do it right, remove this
 * functionality, write a script that utilizes the model, and do it via CRON.
 *
 * Long comment provided because I feel some insight into the reasons behind this
 * clunky method will bring some comfort to you.
 */
function manageHealthNotifications(req, res, next)
{
	const sort = {year: -1, month: -1};

	//Get most recent notification
	HealthNotification.findOne({}).sort(sort).then(notification => {
		if (notification)
		{
			//If notification exists, get the month & year it was sent
			const previousMonth = notification.month;
			const previousYear = notification.year;
			let nextMonth = 0;
			let nextYear = previousYear;
			if (previousMonth == 1)
			{
				nextMonth = 7;
			}
			else if (previousMonth == 7)
			{
				nextMonth = 1;
				nextYear++;
			}

			//Determine if the current month & year is past the "next notification date"
			//If it is, send the notification and record it
			const currentMonth = getCurrentMonth();
			const currentYear = getCurrentYear();

			const isSameYear = (currentYear == nextYear);
			const isNextYear = (currentYear > nextYear);
			const isPastNextNotificationMonth = (currentMonth >= nextMonth);
			const shouldNotify = isNextYear || (isSameYear && isPastNextNotificationMonth);
			if (shouldNotify)
			{
				return getBuildingRepEmails().then(emails => {
					const notificationPromise = createNotification(emails, nextMonth, nextYear);
					const emailPromise = sendBuildingRepEmail(emails);
					return Promise.all([notificationPromise, emailPromise]);
				}).then(() => {
					return getAgencyRepEmails();
				}).then(emails => {
					return sendAgencyRepEmail(emails);
				}).then(() => {
					next();
					return;
				});
			}
			else
			{
				next();
				return;
			}
		}
		else
		{
			/**
			 * If no notifications have been sent, insert a stub to base future
			 * notifications off of. This is so the system can be initialized
			 * at any time and still provide the first set of notifications at
			 * a reasonable time.
			 *
			 * With a CRON, none of this logic would be required -- simply
			 * send the notification every Jan 1/July 1.
			 */
			//Months are 0-indexed when using Date()
			let initialMonth = getCurrentMonth();
			let initialYear = getCurrentYear();

			if (initialMonth <= 3)
			{
				//If it is March or earlier,
				//set first notification's month to January - first notification goes out July 1st
				initialMonth = 1;
			}
			else if (initialMonth > 3 && initialMonth <= 9)
			{
				//If it is between April and September,
				//set first notification's month to July - first notification sent Jan 1st of next year
				initialMonth = 7;
			}
			else
			{
				//If it is October or later,
				//set first notification's month to January of next year - first notification sent July 1st of next year
				initialMonth = 1;
				initialYear++;
			}

			return createNotification([], initialMonth, initialYear).then(() => {
				next();
				return;
			});
		}
	});
}

/**
 * Retrieves a list of e-mail addresses for all building reps that need to be notified
 * @return Promise
 */
function getBuildingRepEmails()
{
	const populate = {
		path: 'reps',
		model: 'User'
	};
	return BuildingAgency.find({health: {$lt: 0.75}}).populate(populate).exec().then(buildingAgencies => {
		let allRepEmails = [];

		//For all (unhealthy) building-agency units
		for (let i = 0; i < buildingAgencies.length; i++)
		{
			const buildingAgency = buildingAgencies[i];
			const buildingAgencyReps = buildingAgency.reps;

			//For all reps on those building-agency units
			for (let j = 0; j < buildingAgencyReps.length; j++)
			{
				//If the rep is not in the list of people to e-mail yet, add them
				const email = buildingAgencyReps[j].email;
				if (allRepEmails.indexOf(email) == -1)
				{
					allRepEmails.push(email);
				}
			}
		}

		return allRepEmails;
	});
}

/**
 * Retrieves a list of e-mail addresses for all agency reps that need to be notified
 * @return Promise
 */
function getAgencyRepEmails()
{
	return getUnhealthyAgencyIds().then(agencyIds => {
		Agency.find({_id: {$in: agencyIds}}).populate('reps').then(agencies => {
			let agencyRepEmails = [];
			for (let i = 0; i < agencies.length; i++)
			{
				const reps = agencies[i].reps;
				for (let j = 0; j < reps.length; j++)
				{
					const email = reps[j].email;
					if (agencyRepEmails.indexOf(email) == -1)
					{
						agencyRepEmails.push(email);
					}
				}
			}

			return agencyRepEmails;
		});
	});
}

/**
 * Returns a list of IDs for all agencies containing at least one unhealthy building
 * @return Promise
 */
function getUnhealthyAgencyIds()
{
	const populate = {
		path: 'reps',
		model: 'User'
	};
	return BuildingAgency.find({health: {$lt: 0.75}}).populate(populate).exec().then(buildingAgencies => {
		let agencyIds = [];

		//For all (unhealthy) building-agency units
		for (let i = 0; i < buildingAgencies.length; i++)
		{
			//Collect agency IDs for agencies that need to be notified
			const currentAgencyId = buildingAgencies[i].agencyId;
			if (agencyIds.indexOf(currentAgencyId) == -1)
			{
				agencyIds.push(currentAgencyId);
			}
		}

		return agencyIds;
	});
}

/**
 * Creates and saves a notification.
 * Does not send any e-mails
 * @return Promise
 */
function createNotification(emails, month, year)
{
	const newNotification = new HealthNotification({
		month: month,
		numberNotified: emails.length,
		year: year
	});

	return newNotification.save();
}

/**
 * Sends a health notification to the given building reps' e-mail addresses
 * @param string[] emails
 * @return Promise
 */
function sendBuildingRepEmail(emails)
{
	const mailDispatcher = new MailDispatcher();
	const to = [];
	const cc = [];
	const bcc = emails;
	const subject = 'Buildings require your attention';
	const template = 'notifications/health-br';
	const args = {};
	return mailDispatcher.sendEmailWithTemplate(to, subject, template, args, cc, bcc);
}

/**
 * Sends a health notification to the given agency reps' e-mail addresses
 * @param string[] emails
 * @return Promise
 */
function sendAgencyRepEmail(emails)
{
	const mailDispatcher = new MailDispatcher();
	const to = [];
	const cc = [];
	const bcc = emails;
	const subject = 'Agency requires your attention';
	const template = 'notifications/health-ar';
	const args = {};
	return mailDispatcher.sendEmailWithTemplate(to, subject, template, args, cc, bcc);
}


/**
 * Returns the current month, 1-indexed (1 = Jan, 12 = Dec)
 * @return number
 */
function getCurrentMonth()
{
	const now = new Date();
	return now.getMonth() + 1;
}

/**
 * Returns the current month as a 4-digit number (e.g. 2018)
 * @return number
 */
function getCurrentYear()
{
	const now = new Date();
	return now.getFullYear();
}

module.exports = manageHealthNotifications;
