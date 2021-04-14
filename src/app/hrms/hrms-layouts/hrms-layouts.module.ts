import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import { HrmsLayoutsComponent } from './hrms-layouts.component';

import { HrmsFooterComponent } from './hrms-footer/hrms-footer.component';
import { HrmsSidebarComponent } from './hrms-sidebar/hrms-sidebar.component';
import { HrmsHeaderComponent } from './hrms-header/hrms-header.component';


@NgModule({
	declarations: [
        HrmsLayoutsComponent,
        HrmsHeaderComponent,
        HrmsFooterComponent,
        HrmsSidebarComponent,
	],
	exports: [
        HrmsLayoutsComponent,
        HrmsHeaderComponent,
        HrmsFooterComponent,
        HrmsSidebarComponent,
	],
	imports: [
		RouterModule,
	]
})
export class HrmsLayoutsModule {
}