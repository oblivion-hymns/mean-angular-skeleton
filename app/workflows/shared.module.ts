/**
 * Makes commonly-used modules & providers available to all modules
 */
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {LoadingComponent} from './../components/utility/loading.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		FlexLayoutModule,
		HttpClientModule,

		MatCardModule,
		MatIconModule,
		MatToolbarModule
	],

	//Make these modules/directives/components available to other areas of the application
	exports: [
		CommonModule,
		FlexLayoutModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		RouterModule,

		MatCardModule,
		MatIconModule,
		MatToolbarModule,

		LoadingComponent
	],

	//Components, directives and pipes that comprise this module
	declarations: [
		LoadingComponent
	],

	entryComponents: []
})
export class SharedModule
{
	/**
	 * Allows us to lazy load the module and still use singleton providers
	 * @return any
	 */
	static forChild(): ModuleWithProviders
	{
		return {
			ngModule: SharedModule,
			providers: []
		}
	}
}
