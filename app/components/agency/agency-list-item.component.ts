import { Component, Input } from '@angular/core';
import { Agency } from './../../models/agency/agency';

@Component({
	selector: 'mercury-agency-list-item',
	templateUrl: './agency-list-item.component.html'
})
export class AgencyListItemComponent
{
	@Input() agency: Agency = null;

	getRepText()
	{
		let string = 'No agency reps';
		if (this.agency.reps.length == 1)
		{
			string = '1 agency rep';
		}
		else if (this.agency.reps.length > 1)
		{
			string = this.agency.reps.length + ' agency reps';
		}

		return string;
	}
}
