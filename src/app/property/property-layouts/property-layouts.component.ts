import { Component, OnInit,AfterViewInit, ViewEncapsulation } from '@angular/core';
import {Helpers} from "../../helpers";
import {Router} from '@angular/router'
import { NgxSpinnerService } from "ngx-spinner";
import {MainService} from '../service/main.service';
import {PropertySettingService} from '../service/property-setting.service'
@Component({
  selector: '.page-wrapper',
  templateUrl: './property-layouts.component.html',
  styleUrls: ['./property-layouts.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PropertyLayoutsComponent implements AfterViewInit {

  constructor(private settingService: PropertySettingService,private spinner:NgxSpinnerService, private mainService: MainService,private router : Router) { }
  b_acct_id=-1;
  erpUser;
  allFields=[];
  allCodeValue=[];
  codeValueObj={};
  codeValueTechObj={};
  codeValueShowObj={};
  codeValueShowTempObj={};
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
   this.spinner.show()
    var resp = await this.settingService.getCodeValue(this.b_acct_id);
    var codeValueTempObj={}
    var codeValueShowTempObj={};
    if(resp['error']==false){
      this.spinner.hide()
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
      this.spinner.hide()
    }

  }
  ngAfterViewInit() {

    // initialize layout: handlers, menu ...
    Helpers.initLayout();

  }

}

