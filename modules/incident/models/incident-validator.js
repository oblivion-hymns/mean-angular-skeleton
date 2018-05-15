class IncidentValidator
{
	constructor()
	{
		/**
		 * @param Incident incident
		 */
		function validateIncident(incident)
		{
			if (!incident.name)
			{
				throw 'Must provide a name';
			}

			if (incident.name.length < 3)
			{
				throw 'Incident name must be at least 3 letters long';
			}
		}

		/**
		 * @param Incident[] incident
		 */
		function validateFields(incident)
		{
			const fields = incident.fields || [];
			for (let i = 0; i < fields.length; i++)
			{
				const currentField = fields[i];
				const label = currentField.label || null;
				if (!label)
				{
					throw 'Field ' + i + ' must have a label';
				}

				//Validate type
				const type = currentField.type || null;
				if (!type)
				{
					throw label + ' field must have a type';
				}

				//Validate order
				if (currentField.order === null)
				{
					throw 'Field ' + i + ' must have an order';
				}
			}
		}

		this.validateIncident = validateIncident.bind(this);
		this.validateFields = validateFields.bind(this);
	}

	/**
	 * Throws an exception if incident is invalid
	 * @param Incident incident
	 */
	validate(incident)
	{
		this.validateIncident(incident);
		this.validateFields(incident);
	}
}

module.exports = IncidentValidator;
