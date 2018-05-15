import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'mercury-incident-field-file',
	templateUrl: './incident-field-file.component.html'
})
export class IncidentFieldFileComponent implements OnInit
{
	public label: string = 'New File Upload';
	public options: any[] = [];
	public properties: any = {};
	public display: boolean = false;
	@Input('readonly') public readonly: boolean = true;

	public allowDoc: boolean = false;
	public allowImg: boolean = false;
	public allowPdf: boolean = false;

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

		this.allowDoc = this.properties.allowDoc;
		this.allowImg = this.properties.allowImg;
		this.allowPdf = this.properties.allowPdf;
	}
}
