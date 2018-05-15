import { Component } from '@angular/core';

/**
 * Currently, if we apply styles to a directive via host binding, those styles are considered
 * static and thus will not be rendered by Angular correctly. For now, instead of using a directive,
 * we are using a component and wrapping <ng-content> in a div with the appropriate attributes.
 * Not the optimal solution, but it's all we have for now. We do desperately need this pseudo-directive
 * because otherwise we'd have to type every single style for every single one-column page (which is most of them).
 *
 * See the first half of https://github.com/angular/flex-layout/issues/76 for more information
 */
@Component({
	selector: 'responsive-layout-login',
	templateUrl: './responsive-layout-login.component.html'
})
export class ResponsiveLayoutLoginComponent
{
	constructor() {}
}
