import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as CanvasJS from '../../../assets/js/scripts/canvasjs.min';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import {DashboardService} from './../service/dashboard.service';
import { from } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-property-dash',
  templateUrl: './property-dash.component.html',
  styleUrls: ['./property-dash.component.css']
})
export class PropertyDashComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;

  total_sold_properties = 0;
  total_available_properties = 0;
  total_allotements = 0;
  total_boolet_purchase = 0;
  total_applicant = 0;

  allArrAllotment=[];
  allArrSubScheme=[];

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getDashBoardCountInfo();
    //await this.getAllotmentInfo();
    //await this.getSubSchemeInfo();

    this.buildAllotmentChart();
    this.buildSubSchemeChart()
  }


  async getDashBoardCountInfo() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.dashboardService.getDashBoardCount(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
     this.total_sold_properties = resp.data[0][0]['total_sold_properties'];
     this.total_available_properties = resp.data[1][0]['total_available_properties'];
     this.total_allotements = resp.data[2][0]['total_allotements'];
     this.total_boolet_purchase = resp.data[3][0]['total_boolet_purchase'];
     this.total_applicant = resp.data[4][0]['total_applicant'];

    } else {
      this.spinner.hide()
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000
      });
    }
  }

  async getAllotmentInfo() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.dashboardService.getAllotmentInYears(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
     this.allArrAllotment=resp.data;
    } else {
      this.spinner.hide()
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000
      });
    }
  }

  async getSubSchemeInfo() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.dashboardService.getSubSchemeInYears(obj);
    if (resp['error'] == false) {
     this.allArrSubScheme=resp.data;
    } else {
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000
      });
    }
  }
  buildAllotmentChart() {
    var dp = [];
    var dpTempObj={};
    for(var i=0;i<this.allArrAllotment.length;i++){
      if(dpTempObj[this.allArrAllotment[i].grade_pay_code]==undefined){
        dpTempObj[this.allArrAllotment[i].grade_pay_code] = 1;
      }else{
        dpTempObj[this.allArrAllotment[i].grade_pay_code]++;
      }
    }
    var keys = Object.keys(dpTempObj)
    for(var i=0;i<keys.length;i++){
      dp.push({y:dpTempObj[keys[i]],label: keys[i]})
    }
    let chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Allotment In Years"
      },
      data: [{
        type: "column",
        dataPoints: dp
      }]
    });

    chart.render();
  }
  buildSubSchemeChart() {
    var dp = [];
    var dpTempObj={};
    for(var i=0;i<this.allArrSubScheme.length;i++){
      if(dpTempObj[this.allArrSubScheme[i].class_code]==undefined){
        dpTempObj[this.allArrSubScheme[i].class_code] = 1;
      }else{
        dpTempObj[this.allArrSubScheme[i].class_code]++;
      }
    }
    var keys = Object.keys(dpTempObj)
    for(var i=0;i<keys.length;i++){
      dp.push({y:dpTempObj[keys[i]],label: keys[i]})
    }
    let chart = new CanvasJS.Chart("chartContainer1", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Sub Scheme In Years"
      },
      data: [{
        type: "column",
        dataPoints: dp
      }]
    });

    chart.render();
  }


}
