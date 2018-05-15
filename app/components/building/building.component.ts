import { Component, Input } from '@angular/core';
import { Building } from './../../models/building/building';

@Component({
	selector: 'mercury-building',
	styles: [`
		h3
		{
			margin-top: 0px;
		}
	`],
	templateUrl: './building.component.html'
})
export class BuildingComponent
{
	@Input() building: Building = null;
}
