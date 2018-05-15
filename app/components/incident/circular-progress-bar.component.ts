import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
	selector: 'mercury-circular-progress-bar',
	styleUrls: ['./circular-progress-bar.component.css'],
	templateUrl: './circular-progress-bar.component.html'
})
export class CircularProgressBarComponent implements OnInit, OnChanges
{
	public caption: string = '';
	public circumference: number = 0;
	public offset: number = 0;
	public radius: number = 48;
	public textColor: string = '';
	public strokeColor: string = '';
	public valueText: string = '0%';

	//From 0 to 1
	@Input('value') percentage: number = 0;

	ngOnInit()
	{
		this.initialize();
	}

	ngOnChanges()
	{
		this.initialize();
	}

	initialize()
	{
		if (this.percentage > 1.0)
		{
			throw 'CircularProgressBarComponent: Value must be between 0.0 and 1.0';
		}

		this.calculateCircumference();
		this.calculateLength();
		this.calculateStrokeColorAndCaption();

		const displayPercentage = Math.ceil(this.percentage * 100);
		this.valueText = '' + displayPercentage + '%';
	}

	update()
	{
		this.initialize();
	}

	/**
	 * Calculates the circumference of the circle, for other calculations to be based on
	 */
	calculateCircumference()
	{
		this.circumference = 2 * Math.PI * this.radius;
	}

	/**
	 * Calculates the length of the progress bar itself
	 */
	calculateLength()
	{
		//Offset is backwards --
		//So if the circumference is 300, '0' is full and '300' is empty
		this.offset = this.circumference - (this.circumference * this.percentage);
	}

	calculateStrokeColorAndCaption()
	{
		this.textColor = 'rgb(0, 0, 0)';
		if (this.percentage >= 1.00)
		{
			this.caption = 'Perfect';
			this.textColor = 'rgb(0, 153, 51)';
			this.strokeColor = 'rgb(0, 153, 51)';
		}
		else if (this.percentage >= 0.90)
		{
			this.caption = 'Excellent';
			this.strokeColor = 'rgb(0, 186, 27)';
		}
		else if (this.percentage >= 0.85)
		{
			this.caption = 'Very Good';
			this.strokeColor = 'rgb(127, 209, 20)';
		}
		else if (this.percentage >= 0.70)
		{
			this.caption = 'Good';
			this.strokeColor = 'rgb(109, 173, 0)';
		}
		else if (this.percentage >= 0.50)
		{
			this.caption = 'Fair';
			this.strokeColor = 'rgb(226, 139, 0)';
		}
		else if (this.percentage >= 0.30)
		{
			this.caption = 'Poor';
			this.strokeColor = 'rgb(209, 117, 20)';
		}
		else
		{
			this.caption = 'Very Poor';
			this.strokeColor = 'rgb(165, 0, 0)';
		}
	}
}
