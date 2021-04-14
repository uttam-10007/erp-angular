import { Component, AfterViewInit, OnInit} from '@angular/core';
import {MainService} from '../../service/main.service';

@Component({
  selector: '[app-accounts-header]',
  templateUrl: './accounts-header.component.html',
  styleUrls: ['./accounts-header.component.css']
})
export class AccountsHeaderComponent implements OnInit {

  constructor(public mainService: MainService) { }
  userInfo={emp_name:'Ram Prasad'}
  imgURL;
  async ngOnInit() {

    
   
   
  }
  ngAfterViewInit()  {
	}

}
