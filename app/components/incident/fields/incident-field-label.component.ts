import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'mercury-incident-field-label',
	templateUrl: './incident-field-label.component.html'
})
export class IncidentFieldLabelComponent implements OnInit
{
	public label: string = 'New Label';
	public options: any[] = [];
	public properties: any = {};
	public text: string = '';
	public readonly: boolean = true;

	public display: boolean = false;

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

		this.text = this.properties.text;
	}
}
