import { Component, AfterViewInit, OnInit} from '@angular/core';
import {MainService} from '../../service/main.service';

@Component({
  selector: '[app-property-header]',
  templateUrl: './property-header.component.html',
  styleUrls: ['./property-header.component.css']
})
export class PropertyHeaderComponent implements AfterViewInit{

  constructor(public mainService: MainService) { }
  userInfo={emp_name:'Ram Prasad'}
  imgURL;
  async ngOnInit() {

    
   
   
  }
  ngAfterViewInit()  {
	}

}