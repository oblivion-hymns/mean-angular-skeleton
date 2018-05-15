import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'mercury-incident-field-number',
	templateUrl: './incident-field-number.component.html'
})
export class IncidentFieldNumberComponent implements OnInit
{
	public label: string = 'New Number';
	public options: any[] = [];
	public properties: any = {};
	public min: number = 0;
	public max: number = 999999999;
	public display: boolean = false;

	@Input('readonly') public readonly: boolean = true;
	@Input('value') public value: number;
	@Output() public onChange = new EventEmitter();

	ngOnInit()
	{
		this.parseProperties();
	}

	parseProperties()
	{
		if (!this.properties)
		{
			return;
		}

		if (this.properties.min)
		{
			this.min = this.properties.min;
		}

		if (this.properties.max)
		{
			this.max = this.properties.max;
		}
	}

	emitValue()
	{
		this.onChange.emit({value: this.value});
	}
}
