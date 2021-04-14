
import { Component, AfterViewInit, OnInit} from '@angular/core';
import {MainService} from '../../service/main.service';

@Component({
  selector: '[app-hrms-header]',
  templateUrl: './hrms-header.component.html',
  styleUrls: ['./hrms-header.component.css']
})
export class HrmsHeaderComponent implements AfterViewInit{

  constructor(public mainService: MainService) { }
  userInfo={emp_name:'Ram Prasad'}
  imgURL;
  async ngOnInit() {

    
   
   
  }
  ngAfterViewInit()  {
	}

}