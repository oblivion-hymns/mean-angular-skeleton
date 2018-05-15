import { Component, Input } from '@angular/core';

@Component({
	selector: 'mercury-loading',
	templateUrl: './loading.component.html'
})
export class LoadingComponent
{
	@Input('loading') isLoading: boolean = false;
	@Input('error') isError: boolean = false;
	@Input('errorIcon') errorIcon: string = 'not_interested';
	@Input('errorMessage') errorMessage: string = 'Error loading data';
	@Input('results') hasResults: boolean = false;
	@Input('resultsIcon') resultsIcon: string = 'not_interested';
	@Input('resultsMessage') emptyMessage: string = 'None found';
}
