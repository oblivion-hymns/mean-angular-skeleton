import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';

@Component({
	selector: 'mercury-incident-field-single-line-text',
	templateUrl: './incident-field-single-line-text.component.html'
})
export class IncidentFieldSingleLineTextComponent implements OnInit
{
	public label: string = 'New Single-line Text';
	public options: any[] = [];
	public properties: any = {};
	public maxLength: number = 32;
	public display: boolean = false;

	@Input('readonly') public readonly: boolean = true;
	@Input('value') public value: string = '';
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

		if (this.properties.maxLength)
		{
			this.maxLength = this.properties.maxLength;
		}
	}

	emitValue()
	{
		this.onChange.emit({value: this.value});
	}
}
