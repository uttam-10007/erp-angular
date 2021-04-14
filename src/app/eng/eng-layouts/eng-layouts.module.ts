import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import { EngLayoutsComponent } from './eng-layouts.component';

import { EngFooterComponent } from './eng-footer/eng-footer.component';
import { EngSidebarComponent } from './eng-sidebar/eng-sidebar.component';
import { EngHeaderComponent } from './eng-header/eng-header.component';


@NgModule({
	declarations: [
        EngLayoutsComponent,
        EngHeaderComponent,
        EngFooterComponent,
        EngSidebarComponent,
	],
	exports: [
        EngLayoutsComponent,
        EngHeaderComponent,
        EngFooterComponent,
        EngSidebarComponent,
	],
	imports: [
		RouterModule,
	]
})
export class EngLayoutsModule {
}