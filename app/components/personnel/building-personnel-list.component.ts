import { Component, Input, Output, OnInit } from '@angular/core';
import { Agency } from './../../models/agency/agency';
import { Building } from './../../models/building/building';
import { Personnel } from './../../models/personnel/personnel';
import { PersonnelService } from './../../models/personnel/personnel.service';

@Component({
	selector: 'mercury-building-personnel-list',
	templateUrl: './building-personnel-list.component.html'
})
export class BuildingPersonnelListComponent implements OnInit
{
	@Input() building: Building = null;
	public personnel: Personnel[] = [];
	public displayPersonnel: Personnel[] = [];
	public selectedFloor: string = '';
	public isLoading: boolean = false;
	public isError: boolean = false;
	public searchQuery: string = '';
	public subscription = null;

	constructor(private personnelService: PersonnelService) {}

	ngOnInit()
	{
		if (this.building && this.building.floors)
		{
			this.personnel = [];
			this.displayPersonnel = [];
			this.loadPersonnel(this.building.floors[0]);
		}
	}

	filterPersonnel()
	{
		let query = this.searchQuery;
		if (query)
		{
			query = query.trim().toLowerCase();
			this.displayPersonnel = this.personnel.filter(person => {
				const firstName = person.name.first.toLowerCase();
				const lastName = person.name.last.toLowerCase();
				const nameKey = firstName + lastName;
				return (nameKey.indexOf(query) > -1);
			});
		}
		else
		{
			this.displayPersonnel = this.personnel.slice();
		}
	}

	/**
	 * @param string floor
	 */
	loadPersonnel(floor)
	{
		this.searchQuery = '';
		this.isLoading = true;
		this.isError = false;
		this.selectedFloor = floor;
		this.personnel = [];
		this.displayPersonnel = [];

		if (this.subscription)
		{
			this.subscription.unsubscribe();
		}

		let callback = null;
		if (floor)
		{
			callback = this.personnelService.loadForBuildingAndFloor(this.building.id, floor);
		}
		else
		{
			callback = this.personnelService.loadForBuilding(this.building.id);
		}

		this.subscription = callback.subscribe(personnel => {
			this.personnel = personnel;
			this.isLoading = false;
			this.displayPersonnel = this.personnel.slice();
		}, error => {
			this.isError = true;
			this.isLoading = false;
		});
	}
}
