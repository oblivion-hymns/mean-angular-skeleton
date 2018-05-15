import {CanActivate, Routes, RouterModule} from '@angular/router';

const APP_ROUTES: Routes = [
	{path: '', redirectTo: '/home', pathMatch: 'full'},
	{path: 'home', loadChildren: './workflows/home/home.module#HomeModule'}
];

export const AppRouting = RouterModule.forRoot(APP_ROUTES);
