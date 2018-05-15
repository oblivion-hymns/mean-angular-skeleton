import {Component, Input} from '@angular/core';
import {BuildingAgency} from './../../models/building-agency/building-agency';

@Component({
	selector: 'mercury-building-agency-list-item',
	templateUrl: './building-agency-list-item.component.html'
})
export class BuildingAgencyListItemComponent
{
	@Input() buildingAgency: BuildingAgency = null;
}
