import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Agency } from './../../models/agency/agency';
import { AgencyService } from './../../models/agency/agency.service';
import { User } from './../../models/user/user';
import { UserService } from './../../models/user/user.service';

@Component({
	selector: 'mercury-assign-head-ar',
	templateUrl: './assign-head-agency-rep.component.html'
})
export class AssignHeadAgencyRepComponent implements OnInit
{
	public isLoading: boolean = true;
	public isError: boolean = false;

	public isSearching: boolean = false;
	public searchSubscription;
	public searchQuery: string = '';
	public searchResults: User[] = [];

	@ViewChild('searchField') searchField: ElementRef;
	@Input('agency') agency: Agency;

	constructor(private agencyService: AgencyService, private userService: UserService) {}

	ngOnInit()
	{
		this.userService.getCurrentUser().subscribe(loggedInUser => {
			this.isLoading = false;

			if (this.searchField)
			{
				this.searchField.nativeElement.focus();
			}
		});
	}

	/**
	 * Finds reps matching the current search query
	 */
	searchReps()
	{
		let query = this.searchQuery || '';
		query = query.trim().toLowerCase();
		if (query)
		{
			this.resetSearch();

			const search = this.userService.search(query).delay(750).debounceTime(750);
			this.searchSubscription = search.subscribe(users => {
				this.searchResults = users;
				this.isSearching = false;
			}, error => {
				this.isSearching = false;
			});
		}
	}

	/**
	 * Cancels the current search subscription and resets the UI
	 */
	resetSearch()
	{
		if (this.searchSubscription)
		{
			this.searchSubscription.unsubscribe();
		}

		this.isSearching = true;
		this.searchResults = [];
	}

	/**
	 * Assigns the given user as the primary agency rep
	 * @param User user
	 */
	assign(user: User)
	{
		const agencyId = this.agency.id;
		const userId = user.id;
		const currentPrimaryRep = this.agency.primaryRep;
		if (currentPrimaryRep)
		{
			this.unassign(currentPrimaryRep);
		}

		this.agencyService.assignPrimaryRep(agencyId, userId).subscribe(() => {
			this.agency.primaryRep = user;
		});
	}

	/**
	 * Removes the given user from the front-end reps display
	 * @param User user
	 */
	unassign(user: User)
	{
		const userId = user.id;
		for (let i = 0; i < this.agency.reps.length; i++)
		{
			const currentRepId = this.agency.reps[i].id;
			if (currentRepId == userId)
			{
				this.agency.reps.splice(i, 1);
			}
		}
	}

	/**
	 * Determines whether the given user is assigned to this agency as the primary rep
	 * @param User user
	 * @return boolean
	 */
	isUserAssigned(user: User)
	{
		const currentPrimaryRep = this.agency.primaryRep;
		if (currentPrimaryRep)
		{
			const isCurrentRep = (currentPrimaryRep.id == user.id);
			return isCurrentRep;
		}

		return false;
	}

	/**
	 * Determines whether the given user is assigned to this agency as a primary rep
	 * @param User user
	 * @return boolean
	 */
	isUserPrimaryRep(user: User)
	{
		const primaryRep = this.agency.primaryRep;
		if (primaryRep)
		{
			const isPrimaryRep = (user.id == primaryRep.id);
			return isPrimaryRep;
		}

		return false;
	}
}
