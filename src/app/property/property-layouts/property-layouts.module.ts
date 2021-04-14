import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import { PropertyLayoutsComponent } from './property-layouts.component';

import { PropertyFooterComponent } from './property-footer/property-footer.component';
import { PropertySidebarComponent } from './property-sidebar/property-sidebar.component';
import { PropertyHeaderComponent } from './property-header/property-header.component';


@NgModule({
	declarations: [
        PropertyLayoutsComponent,
        PropertyHeaderComponent,
        PropertyFooterComponent,
        PropertySidebarComponent,
	],
	exports: [
        PropertyLayoutsComponent,
        PropertyHeaderComponent,
        PropertyFooterComponent,
        PropertySidebarComponent,
	],
	imports: [
		RouterModule,
	]
})
export class PropertyLayoutsModule {
}