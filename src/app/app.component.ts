import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';
import {Helpers} from "./helpers";

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'app';
  constructor(private _router: Router) {}

  async ngOnInit() {
  
	
	if(localStorage.getItem('erpUser')==undefined || localStorage.getItem('erpUser')==null){
		this._router.navigate(['/login']);
	}
	this._router.events.subscribe((route) => {
		if (route instanceof NavigationStart) {
			Helpers.setLoading(true);
			Helpers.bodyClass('fixed-navbar');
		}
		if (route instanceof NavigationEnd) {
			window.scrollTo(0, 0);
			Helpers.setLoading(false);

			// Initialize page: handlers ...
			Helpers.initPage();
		}

	});
  }
 

  ngAfterViewInit() {}

}
