import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
	selector: 'mercury-incident-field-checkbox',
	templateUrl: './incident-field-checkbox.component.html'
})
export class IncidentFieldCheckboxComponent implements OnInit
{
	public label: string = 'New Checkbox';
	public options: any[] = [];
	public properties: any = {};
	public display: boolean = false;

	@Input('readonly') public readonly: boolean = true;
	@Input('value') public value: boolean;
	@Output() public onChange = new EventEmitter();

	ngOnInit()
	{
		if (!this.value)
		{
			//Default to false rather than undefined
			this.value = false;
			this.emitValue();
		}
	}

	emitValue()
	{
		this.onChange.emit({value: this.value});
	}
}
