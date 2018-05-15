import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HelpArticle} from './../../../models/help/help-article';

@Component({
	selector: 'mercury-help-dialog',
	templateUrl: './help-dialog.component.html'
})
export class HelpDialogComponent
{
	public article: HelpArticle = null;

	constructor(public dialogRef: MatDialogRef<HelpDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any)
	{
		if (!data.article)
		{
			throw '[HelpDialogComponent] Must provide an article, even if it is an empty one';
		}

		this.article = data.article;
	}
}
