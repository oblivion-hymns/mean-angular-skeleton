/**
 * Makes commonly-used modules & providers available to all modules
 */
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {DndModule} from 'ng2-dnd';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {HttpClientModule} from '@angular/common/http';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule,
	MatDialogModule, MatDividerModule, MatExpansionModule, MatIconModule, MatInputModule,
	MatListModule, MatMenuModule, MatNativeDateModule, MatProgressSpinnerModule, MatSelectModule,
	MatSnackBarModule, MatTooltipModule, MatToolbarModule } from '@angular/material';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		DndModule.forRoot(),
		FormsModule,
		FlexLayoutModule,
		HttpClientModule,

		MatButtonModule,
		MatCardModule,
		MatCheckboxModule,
		MatChipsModule,
		MatDatepickerModule,
		MatDialogModule,
		MatDividerModule,
		MatExpansionModule,
		MatIconModule,
		MatInputModule,
		MatListModule,
		MatMenuModule,
		MatNativeDateModule,
		MatProgressSpinnerModule,
		MatSelectModule,
		MatSnackBarModule,
		MatToolbarModule,
		MatTooltipModule
	],

	//Make these modules/directives/components available to other areas of the application
	exports: [
		CommonModule,
		FlexLayoutModule,
		FormsModule,
		HttpModule,
		HttpClientModule,
		ReactiveFormsModule,
		RouterModule,
		DndModule,

		MatButtonModule,
		MatCardModule,
		MatCheckboxModule,
		MatChipsModule,
		MatDatepickerModule,
		MatDialogModule,
		MatDividerModule,
		MatExpansionModule,
		MatIconModule,
		MatInputModule,
		MatListModule,
		MatMenuModule,
		MatNativeDateModule,
		MatProgressSpinnerModule,
		MatSelectModule,
		MatSnackBarModule,
		MatToolbarModule,
		MatTooltipModule
	],

	//Components, directives and pipes that comprise this module
	declarations: [

	],

	entryComponents: [

	]
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
