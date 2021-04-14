import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as CanvasJS from '../../../assets/js/scripts/canvasjs.min';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { MainService } from '../service/main.service';
import { AllEmpService } from '../service/all-emp.service'
import { EstablishmentService } from '../service/establishment.service'
import { DashboardService} from '../service/dashboard.service'
import { SalaryHoldAndStartService } from '../service/salary-hold-and-start.service'
import { from } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-hrms-dash',
  templateUrl: './hrms-dash.component.html',
  styleUrls: ['./hrms-dash.component.css']
})
export class HrmsDashComponent implements OnInit {
  constructor(private DashboardService:DashboardService,private mainService:MainService,private SalaryHoldAndStartService: SalaryHoldAndStartService, private es: EstablishmentService, private allEmpService: AllEmpService, private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  retirecount =0
  retire = []
  b_acct_id;
  leftCount = 0;
  activeCount = 0;
  incompleteCount = 0;
  salarycount = 0
  allArr = [];
  allSalaryStop = [];
  allActive = [];
  allLeft = [];
  allIncomplete = [];
  showArr = []
  showArr1 = []
  classDp = [];
  gradeDp = []
  self;
  systemDate
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.DashboardService.getSystemDate();
    this.systemDate = resp.data
    // await this.getAllEmployees();
    await this.getArrangmentInfo();
    await this.getsalarystatus();
    this.buildGradePayChart();
    this.buildclassChart();
    this.buildDesignationChart()
    //this.self = this;
  
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  public mbarChartLabels1: string[] = ['I', 'II', 'III', 'IV', 'NA'];
  public mbarChartLabels: string[] = [];
  public mbarChartLabels2: string[] = [];

  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartColors: Array<any> = [
    {
      backgroundColor: 'blue',
      borderColor: 'rgba(105,159,177,1)',
      pointBackgroundColor: 'rgba(105,159,177,1)',
      pointBorderColor: '#fafafa',
      pointHoverBackgroundColor: '#fafafa',
      pointHoverBorderColor: 'rgba(105,159,177)'
    },
    {
      backgroundColor: 'red',
      borderColor: 'rgba(77,20,96,1)',
      pointBackgroundColor: 'rgba(77,20,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,20,96,1)'
    }
  ];
  public barChartData: any[] = [
    { data: [], label: 'GRADE PAY' },

  ];
  public barChartData1: any[] = [
    { data: [], label: 'CLASS' },

  ];
  public barChartData2: any[] = [
    { data: [], label: 'DESIGNATION' },

  ];

  // events
  public chartClicked(e: any): void {
    this.showArr1=[]
    var index = e.active[0]._index;
    var gd = this.mbarChartLabels[index];
    for (var i = 0; i < this.allArr.length; i++) {
      if (this.allArr[i]['grade_pay_code'] == gd) {
        this.showArr1.push(this.allArr[i]);

      }
    }
    $('#myModal1').modal('show');
  }
  public chartClicked2(e: any): void {
    this.showArr1=[]
    var index = e.active[0]._index;
    var gd = this.mbarChartLabels2[index];
    for (var i = 0; i < this.allArr.length; i++) {
      if (this.allArr[i]['designation_code'] == gd) {
        this.showArr1.push(this.allArr[i]);

      }
    }
    $('#myModal1').modal('show');
  }
  public chartClicked1(e: any): void {
    this.showArr1=[]
    var index = e.active[0]._index;
    var cls = this.mbarChartLabels1[index];
    for (var i = 0; i < this.allArr.length; i++) {
      if (this.allArr[i]['class_code'] == cls) {
        this.showArr1.push(this.allArr[i]);

      }
    }
    $('#myModal1').modal('show');
  }

  async getArrangmentInfo() {

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp_arr = await this.es.getAllCurrentArrangements(obj);
    //var  = await this.es.getAllCurrentArrangements(this.b_acct_id);

    if (resp_arr['error'] == false) {

      this.allArr = resp_arr['data'];
       var arr = this.systemDate.split("-")
       arr[1]= parseInt(arr[1]) + 7
       if(arr[1] > 12){
         arr[1] = parseInt(arr[1]) -12
         arr[0] = parseInt(arr[0]) +1

       }
       if(arr[1] < 10){
        arr[1]= "0"+arr[1]
      }
       var date =arr[0]+"-"+arr[1]+"-"+arr[2]

      for (var i = 0; i < this.allArr.length; i++) {
       
        if (this.allArr[i].emp_status_code == 'JOINING') {
          this.incompleteCount++;
          this.allIncomplete.push(this.allArr[i])
        }
        if (this.allArr[i].emp_status_code == 'ACTIVE') {
          this.activeCount++;
          this.allActive.push(this.allArr[i])

        }
        if (this.allArr[i].emp_status_code == 'INACTIVE') {
          this.leftCount++;
          this.allLeft.push(this.allArr[i])

        }
        if (this.allArr[i].retirement_date <= date &&  this.allArr[i].emp_status_code=='ACTIVE') {
          this.retirecount++;
          this.retire.push(this.allArr[i])
        }
      }
      
    var arrre = []
    for (var i = this.sortData.length -1; i >= 0; i--) {
      arrre.push(this.sortData[i])
    }
    this.retire = arrre
    

    
    } else {
      this.snackBar.open(resp_arr['data'], 'Error', {
        duration: 5000
      });
    }

  }
  get sortData() {
    return this.retire.sort((a, b) => {
      return <any>new Date(b.retirement_date) - <any>new Date(a.retirement_date);
    });
  }
  buildGradePayChart() {
    var dp = [];
    var dpTempObj = {};
    for (var i = 0; i < this.allActive.length; i++) {
      if (dpTempObj[this.allActive[i].grade_pay_code] == undefined) {
        dpTempObj[this.allActive[i].grade_pay_code] = 1;
      } else {
        dpTempObj[this.allActive[i].grade_pay_code]++;
      }
    }
    var keys = Object.keys(dpTempObj)
    for (var i = 0; i < keys.length; i++) {
      this.mbarChartLabels.push(keys[i]);
      this.barChartData[0]['data'].push(dpTempObj[keys[i]])
      //dp.push({y:dpTempObj[keys[i]],label: keys[i]})
    }

  }
  buildDesignationChart() {
    var dp = [];
    var dpTempObj = {};
    for (var i = 0; i < this.allActive.length; i++) {
      if (dpTempObj[this.allActive[i].designation_code] == undefined) {
        dpTempObj[this.allActive[i].designation_code] = 1;
      } else {
        dpTempObj[this.allActive[i].designation_code]++;
      }
    }
    var keys = Object.keys(dpTempObj)
    for (var i = 0; i < keys.length; i++) {
      this.mbarChartLabels2.push(keys[i]);
      this.barChartData2[0]['data'].push(dpTempObj[keys[i]])
      //dp.push({y:dpTempObj[keys[i]],label: keys[i]})
    }

  }
  buildclassChart() {
    //var dp = [];
    var dpTempObj = {};
    for (var i = 0; i < this.allActive.length; i++) {
      if (dpTempObj[this.allActive[i].class_code] == undefined) {
        dpTempObj[this.allActive[i].class_code] = 1;
      } else {
        dpTempObj[this.allActive[i].class_code]++;
      }
    }
    //var keys = Object.keys(dpTempObj)


    this.barChartData1[0].data.push(dpTempObj['I'])
    this.barChartData1[0].data.push(dpTempObj['II'])
    this.barChartData1[0].data.push(dpTempObj['III'])
    this.barChartData1[0].data.push(dpTempObj['IV'])
    this.barChartData1[0].data.push(dpTempObj['NA'])


  }



  async getsalarystatus() {
    var resp = await this.SalaryHoldAndStartService.getstopsalary(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allSalaryStop = resp.data;
      this.salarycount = resp.data.length
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee all  list", 'Error', {
        duration: 5000
      });
    }
  }
  modalOpen(i) {
    this.showArr = []
    if (i == 1) {
      this.showArr = this.allIncomplete
      $('#myModal').modal('show');
    }
    if (i == 2) {
      this.showArr = this.allActive
      $('#myModal').modal('show');
    }
    if (i == 3) {
      this.showArr = this.allLeft
      $('#myModal4').modal('show');
    }
    if (i == 4) {
      this.showArr = this.allSalaryStop
      $('#myModal2').modal('show');
    }
    if (i == 5) {
      this.showArr = this.retire
      $('#myModal3').modal('show');
    }


  }

}

