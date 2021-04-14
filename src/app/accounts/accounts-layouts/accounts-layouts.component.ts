
import { Component, OnInit,AfterViewInit, ViewEncapsulation } from '@angular/core';
import {Helpers} from "../../helpers";
import {Router} from '@angular/router'
import {MainService} from '../service/main.service';
import {SettingService} from '../service/setting.service';
@Component({
  selector: '.page-wrapper',
  templateUrl: './accounts-layouts.component.html',
  styleUrls: ['./accounts-layouts.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AccountsLayoutsComponent implements AfterViewInit {

  constructor(private settingService:SettingService,private mainService: MainService,private router : Router) { }
  b_acct_id=-1;
  erpUser;
  allFields=[];
  allCodeValue=[];
  codeValueObj={};
  codeValueTechObj={};
  codeValueShowObj={};
  async ngOnInit() {
    if(localStorage.getItem('erpUser')==undefined || localStorage.getItem('erpUser')==null){
      this.router.navigate(['/login']);
    }else{
      this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
      this.b_acct_id = this.erpUser.b_acct_id;
      await this.getCodeValue();
     
    }
  }
  async getCodeValue(){
   
    var resp = await this.settingService.getCodeValue(this.b_acct_id);
    var codeValueTempObj={}
    var codeValueShowTempObj={};
    if(resp['error']==false){
      for(var i=0;i<resp.data.length;i++){
        if(codeValueTempObj[resp.data[i]['field_code']]== undefined){
          codeValueTempObj[resp.data[i]['field_code']] = [];
          codeValueShowTempObj[resp.data[i]['field_code']] ={}
        }
        codeValueShowTempObj[resp.data[i]['field_code']][resp.data[i].code] = resp.data[i].value;
        codeValueTempObj[resp.data[i]['field_code']].push(resp.data[i])
      }
      this.codeValueObj = codeValueTempObj;
      this.codeValueShowObj = codeValueShowTempObj;
      this.mainService.codeValueTechObj = this.codeValueObj;
      this.mainService.codeValueShowObj = this.codeValueShowObj;

    }else{

    }

  }
  ngAfterViewInit() {

    // initialize layout: handlers, menu ...
    Helpers.initLayout();

  }

}


