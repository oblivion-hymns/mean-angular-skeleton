import { Component, ComponentFactoryResolver, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';

import { IncidentField } from './../../../models/incident/incident-field';
import { IncidentFieldCheckboxComponent } from './incident-field-checkbox.component';
import { IncidentFieldDateComponent } from './incident-field-date.component';
import { IncidentFieldFileComponent } from './incident-field-file.component';
import { IncidentFieldLabelComponent } from './incident-field-label.component';
import { IncidentFieldMultiLineTextComponent } from './incident-field-multi-line-text.component';
import { IncidentFieldNumberComponent } from './incident-field-number.component';
import { IncidentFieldSingleLineTextComponent } from './incident-field-single-line-text.component';

@Component({
	selector: 'mercury-incident-field',
	templateUrl: './incident-field.component.html'
})
export class IncidentFieldComponent implements OnInit
{
	@Input('field') @Output() field: IncidentField = null;
	@Input('display') display: boolean = false;
	@Input('readonly') readonly: boolean = true;
	@Input('value') @Output() value: any;
	@ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent;

	public componentFactory;
	public componentInstance;

	public componentLookup: any = {
		"checkbox": IncidentFieldCheckboxComponent,
		"date": IncidentFieldDateComponent,
		"file": IncidentFieldFileComponent,
		"input": IncidentFieldSingleLineTextComponent,
		"label": IncidentFieldLabelComponent,
		"number": IncidentFieldNumberComponent,
		"text": IncidentFieldMultiLineTextComponent
	};

	constructor(private resolver: ComponentFactoryResolver) {}

	ngOnInit()
	{
		this.init();
	}

	init()
	{
		if (this.componentInstance)
		{
			this.fieldComponent.remove(0);
			this.componentInstance = null;
		}

		if (this.field)
		{
			const fieldType = this.field.type;
			const identifier = fieldType.identifier;

			if (!this.componentFactory)
			{
				this.componentFactory = this.resolver.resolveComponentFactory(this.componentLookup[identifier]);
			}

			this.componentInstance = this.fieldComponent.createComponent(this.componentFactory, 0).instance;
			this.componentInstance.options = fieldType.options;
			this.componentInstance.properties = this.field.properties;
			this.componentInstance.label = this.field.label;
			this.componentInstance.readonly = this.readonly;
			this.componentInstance.value = this.value;
			this.componentInstance.display = this.display;
			if (this.componentInstance.onChange)
			{
				this.componentInstance.onChange.subscribe(event => {
					this.updateValue(event);
				});
			}
		}
		else
		{
			throw '[IncidentFieldComponent] Must provide a valid incidentField';
		}
	}

	updateValue(event)
	{
		this.value = event.value;
	}
}
