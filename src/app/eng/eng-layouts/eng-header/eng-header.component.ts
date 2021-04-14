import { Component, AfterViewInit, OnInit} from '@angular/core';
import {MainService} from '../../service/main.service';

@Component({
  selector: '[app-eng-header]',
  templateUrl: './eng-header.component.html',
  styleUrls: ['./eng-header.component.css']
})
export class EngHeaderComponent implements AfterViewInit{

  constructor(public mainService: MainService) { }
  userInfo={emp_name:'Ram Prasad'}
  imgURL;
  async ngOnInit() {

    
   
   
  }
  ngAfterViewInit()  {
	}

}