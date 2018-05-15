import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'mercury-incident-field-multi-line-text',
	templateUrl: './incident-field-multi-line-text.component.html'
})
export class IncidentFieldMultiLineTextComponent implements OnInit
{
	public label: string = 'New Multi-line Text';
	public options: any[] = [];
	public properties: any = {};
	public maxLength: number = 256;
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
