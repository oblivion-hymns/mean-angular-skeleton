import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
	selector: 'mercury-incident-field-date',
	templateUrl: './incident-field-date.component.html'
})
export class IncidentFieldDateComponent
{
	public label: string = 'New Date';
	public options: any[] = [];
	public properties: any = {};
	public display: boolean = false;

	@Input('readonly') public readonly: boolean = true;
	@Input('value') public value: Date = null;
	@Output() public onChange = new EventEmitter();

	emitValue(event)
	{
		/**
		 * This data can come from either an emitted event (if the date picker is used)
		 * or from input (if the user enters the date manually)
		 */
		if (!event.target)
		{
			//It's a datepicker date
			this.value = event;
		}

		//Otherwise, it's a manual input date -- so just leave the value as is
		this.onChange.emit({value: this.value});
	}
}
