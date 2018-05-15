import { Component, Input } from '@angular/core';
import { User } from './../../models/user/user';

@Component({
	selector: 'mercury-user-list-item',
	templateUrl: './user-list-item.component.html'
})
export class UserListItemComponent
{
	@Input('condensed') public isCondensed: boolean = false;
	@Input('user') public user: User = null;
}
