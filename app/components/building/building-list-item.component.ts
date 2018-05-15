import { Component, Input } from '@angular/core';
import { Building } from './../../models/building/building';

@Component({
	selector: 'mercury-building-list-item',
	templateUrl: './building-list-item.component.html'
})
export class BuildingListItemComponent
{
	@Input() building: Building = null;
}
