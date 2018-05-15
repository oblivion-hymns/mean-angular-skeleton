import { Component, Input } from '@angular/core';
import { Agency } from './../../models/agency/agency';

@Component({
	selector: 'mercury-agency',
	styles: [`
		h3
		{
			margin-top: 0px;
		}
	`],
	templateUrl: './agency.component.html'
})
export class AgencyComponent
{
	@Input() agency: Agency = null;
}
