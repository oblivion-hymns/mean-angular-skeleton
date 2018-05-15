import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Agency} from './../../models/agency/agency';
import {AgencyService} from './../../models/agency/agency.service';
import {User} from './../../models/user/user';
import {UserService} from './../../models/user/user.service';

@Component({
	selector: 'mercury-assign-ar',
	templateUrl: './assign-agency-reps.component.html'
})
export class AssignAgencyRepsComponent implements OnInit
{
	public isLoading: boolean = true;
	public isError: boolean = false;

	public isSearching: boolean = false;
	public searchSubscription;
	public searchQuery: string = '';
	public searchResults: User[] = [];
	public loggedInUser: User;

	@ViewChild('searchField') searchField: ElementRef;
	@Input('agency') agency: Agency;

	constructor(private agencyService: AgencyService, private userService: UserService) {}

	ngOnInit()
	{
		this.userService.getCurrentUser().subscribe(loggedInUser => {
			this.loggedInUser = loggedInUser;
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
	 * Assigns the given user as an agency rep
	 * @param User user
	 */
	assign(user: User)
	{
		const agencyId = this.agency.id;
		const userId = user.id;

		const repIndex = this.getRepIndex(user);
		if (repIndex > -1)
		{
			this.agencyService.unassignRep(agencyId, userId).subscribe(() => {
				for (let i = 0; i < this.agency.reps.length; i++)
				{
					const currentRepId = this.agency.reps[i].id;
					if (currentRepId == userId)
					{
						this.agency.reps.splice(i, 1);
					}
				}
			});
		}
		else
		{
			this.agencyService.assignRep(agencyId, userId).subscribe(() => {
				this.agency.reps.push(user);
			});
		}
	}

	/**
	 * Determines if the given user is assigned to this Agency as a rep.
	 * If the user is found, returns the index of that user;
	 * If the user is not found, returns -1.
	 * @param User user
	 * @return int
	 */
	getRepIndex(user: User)
	{
		const reps = this.agency.reps || [];
		const userId = user.id;
		for (let i = 0; i < reps.length; i++)
		{
			const currentRepId = reps[i].id;
			if (currentRepId == userId)
			{
				return i;
			}
		}

		return -1;
	}

	/**
	 * Determines whether or not the logged-in-user is capable of removing
	 * the given user.
	 * @param User user
	 * @return boolean
	 */
	canRemoveUser(user: User)
	{
		const isUserAssigned = this.isUserAssigned(user);
		const isLoggedInUser = this.isLoggedInUser(user);
		return (!this.isUserAssigned && !isLoggedInUser)
	}

	/**
	 * Determines whether the given user is assigned to this agency as a rep
	 * @param User user
	 * @return boolean
	 */
	isUserAssigned(user: User)
	{
		const isAssigned = (this.getRepIndex(user) > -1);
		return isAssigned;
	}

	/**
	 * Determines whether the given user is the primary rep for this agency
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

	/**
	 * Determines if the given user is the same as the currently logged-in one
	 * @param User user
	 * @return boolean
	 */
	isLoggedInUser(user: User)
	{
		return (user.id == this.loggedInUser.id);
	}
}
