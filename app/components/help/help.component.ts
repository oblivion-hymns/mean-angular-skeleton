import {Component} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router, NavigationEnd} from '@angular/router';

import {HelpArticle} from './../../models/help/help-article';
import {HelpDialogComponent} from './dialogs/help-dialog.component';
import {HelpIdentifierParser} from './../../models/help/help-identifier-parser';
import {HelpService} from './../../models/help/help.service';

@Component({
	providers: [HelpService],
	selector: 'mercury-help',
	templateUrl: './help.component.html'
})
export class HelpComponent
{
	public article: HelpArticle = null;

	constructor(private router: Router, private helpService: HelpService, private dialog: MatDialog)
	{
		this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd)
			{
				//Set up help...somehow
				const url = event.urlAfterRedirects;
				let routeConfig = this.router.config;
				const helpIdentifierParser = new HelpIdentifierParser();
				const identifier = helpIdentifierParser.parseIdentifier(url, routeConfig);

				this.helpService.load(identifier).subscribe(article => {
					this.article = article;
				});
			}
		});
	}

	open()
	{
		let dialogRef = this.dialog.open(HelpDialogComponent, {
			data: {article: this.article},
			width: '30%'
		});
	}
}
