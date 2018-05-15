import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home.component';

const routes = [
	{
		path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	},
	{
		path: 'home',
		component: HomeComponent,
		children: [
			{
				path: '',
				redirectTo: 'home',
				pathMatch: 'full'
			}
		]
	},
];

export const HomeRouting = RouterModule.forChild(routes);
