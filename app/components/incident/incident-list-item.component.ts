import { Component, Input } from '@angular/core';

import { Incident } from './../../models/incident/incident';

@Component({
	selector: 'mercury-incident-list-item',
	templateUrl: './incident-list-item.component.html'
})
export class IncidentListItemComponent
{
	@Input() incident: any = null;
}
