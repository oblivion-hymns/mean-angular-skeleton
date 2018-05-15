import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Agency} from './../../models/agency/agency';
import {BuildingAgencyService} from './../../models/building-agency/building-agency.service';
import {Building} from './../../models/building/building';

@Component({
	providers: [BuildingAgencyService],
	selector: 'mercury-agencies-in-building',
	styleUrls: ['./agencies-in-building.component.css'],
	templateUrl: './agencies-in-building.component.html'
})
export class AgenciesInBuildingComponent implements OnInit
{
	@Input('building') public building: Building = null;
	@Input('workflow') public workflow: string = '';
	@Input('selectedAgency') public selectedAgency: Agency = null;

	public allAgencyHealth: number[] = [];

	constructor(private router: Router, private buildingAgencyService: BuildingAgencyService) {}

	ngOnInit()
	{
		const numAgencies = this.building.agencies.length;
		for (let i = 0; i < numAgencies; i++)
		{
			this.assignBuildingAgencyHealth(i, this.building.id, this.building.agencies[i].id);
		}

		if (numAgencies == 1 && !this.selectedAgency)
		{
			this.goToBuildingAgency(this.building.agencies[0]);
		}
	}

	isAgencySelected(agency: Agency)
	{
		if (this.selectedAgency)
		{
			return (agency.id == this.selectedAgency.id);
		}

		return false;
	}

	/**
	 * Gets the health for the given BAU and assigns it to an index matching the agency's index in the scope of the
	 * building's agency list
	 * @param number index
	 * @param string buildingId
	 * @param string agencyId
	 * @return Observable
	 */
	private assignBuildingAgencyHealth(index: number, buildingId: string, agencyId: string)
	{
		this.buildingAgencyService.getHealth(buildingId, agencyId).subscribe((data: any) => {
			this.allAgencyHealth[index] = data.health;
		});
	}

	goToBuildingAgency(agency: Agency)
	{
		const agencyId = agency.id;
		const buildingId = this.building.id;
		const basePath = '/' + this.workflow + '/building-agency';
		this.router.navigate([basePath, agencyId, buildingId]);
	}
}
