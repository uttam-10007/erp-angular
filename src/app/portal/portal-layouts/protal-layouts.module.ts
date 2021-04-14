import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import { PortalLayoutsComponent } from './portal-layouts.component';

import { PortalFooterComponent } from './portal-footer/portal-footer.component';
import { PortalSidebarComponent } from './portal-sidebar/portal-sidebar.component';
import { PortalHeaderComponent } from './portal-header/portal-header.component';


@NgModule({
	declarations: [
      PortalLayoutsComponent,
	  PortalHeaderComponent,
	  PortalFooterComponent,
	  PortalSidebarComponent,
	],
	exports: [
        PortalLayoutsComponent,
        PortalHeaderComponent,
        PortalFooterComponent,
        PortalSidebarComponent,
	],
	imports: [
		RouterModule,
	]
})
export class PortalLayoutsModule {
}