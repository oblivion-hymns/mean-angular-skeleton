/**
 * Bootstrap (base) module
 */
import 'hammerjs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRouting} from './app.routing';

import {HomeModule} from './workflows/home/home.module';
import {SharedModule} from './workflows/shared.module';

@NgModule({
	//Main component of module
	bootstrap: [AppComponent],
	providers: [],

	//Included modules
	imports: [
		BrowserAnimationsModule,
		AppRouting,
		SharedModule.forChild(),
		HomeModule.forChild()
	],

	//Make these components available to other areas of the application
	exports: [],

	//Components, directives and pipes that comprise this module
	declarations: [
		AppComponent
	],
})
export class AppModule {}
