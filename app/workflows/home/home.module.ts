import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from './../shared.module';
import {HomeRouting} from './routes';
import {HomeComponent} from './home.component';

@NgModule({
	//Main component of module
	bootstrap: [
		HomeComponent
	],

	//Included modules
	imports: [
		CommonModule,
		HomeRouting,
		SharedModule
	],

	//Make these components available to other areas of the application
	exports: [],

	//Components, directives and pipes that comprise this module
	declarations: [
		HomeComponent
	],

	entryComponents: []
})
export class HomeModule
{
	/**
	 * Allows us to lazy load the module and still use singleton providers
	 * @return any
	 */
	static forChild(): ModuleWithProviders
	{
		return {
			ngModule: HomeModule,
			providers: []
		}
	}
}
