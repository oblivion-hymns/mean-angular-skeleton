import {Component} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';

import {BreadcrumbBuilder} from './../../models/navigation/breadcrumb-builder';
import {Breadcrumb} from './../../models/navigation/breadcrumb';

@Component({
	selector: 'mercury-breadcrumb',
	templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent
{
	public breadcrumbs: Breadcrumb[] = [];

	constructor(private router: Router)
	{
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd)
			{
				const builder = new BreadcrumbBuilder();
				const routerConfig = this.router.config;
				this.breadcrumbs = builder.build(event.urlAfterRedirects, routerConfig);
			}
		});
	}
}
