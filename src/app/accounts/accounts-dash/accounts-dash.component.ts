import { Component, OnInit } from '@angular/core';
import { LedgerService } from '../service/ledger.service';
import { BillService } from '../service/bill.service';
import { DashboardService } from '../service/dashboard.service';
import swal from 'sweetalert2';
import * as CanvasJS from '../../../assets/js/scripts/canvasjs.min';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { MainService } from '../service/main.service';
import { ChallanService } from '../service/challan.service';
import { JournalService } from '../service/journal.service';
import { BpService } from '../service/bp.service';
import { SettingService } from '../service/setting.service';
declare var $: any;

@Component({
  selector: 'app-accounts-dash',
  templateUrl: './accounts-dash.component.html',
  styleUrls: ['./accounts-dash.component.css']
})
export class AccountsDashComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private settingService: SettingService, private spinner: NgxSpinnerService, private MainService: MainService, private journalService: JournalService, private BPS: BpService, private challanService: ChallanService, private ledgerService: LedgerService, private billService: BillService) { }
  erpUser;



  allEVENT = [{ event_code: 'EV00', event_desc: 'NA', db_cd_ind: 'CR', txn_amt: 5 },
  { event_code: 'EV00', event_desc: 'NA', db_cd_ind: 'DB', txn_amt: 0 }];


  allCOA = [{ chart_of_account: '0000', leaf_value: 'NA', db_cd_ind: 'CR', txn_amt: 5 },
  { chart_of_account: '0000', leaf_value: 'NA', db_cd_ind: 'DB', txn_amt: 0 }];

  cr_asset = 0;
  db_asset = 0;
  cr_liability = 0;
  db_liability = 0;
  cr_equity = 0;
  db_equity = 0;
  cr_income = 0;
  db_income = 0;
  cr_expense = 0;
  db_expense = 0;
  b_acct_id;
  color = []
  color2 = []
  systemDate;
  fin_year = 0;
  from_date;
  to_date;
  dataPrctDate = [];
  async ngOnInit() {
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    this.from_date = firstDay.getFullYear() + '-' + (firstDay.getMonth() + 1) + '-' + firstDay.getDate()
    this.to_date = lastDay.getFullYear() + '-' + (lastDay.getMonth() + 1) + '-' + lastDay.getDate()
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.billService.getSystemDate();
    this.systemDate = resp.data
    await this.randomColor()
    await this.randomColor2()

    await this.getActiveFinYear();
    //chart 1
    await this.getTrialBalance();
    this.buildAmountAndChartOfAccountChartOnLvl2();
    //chart 2
    await this.getAmountLast7Days();
    this.buildAmountAndProcessingDate()
    //chart 3
    // await this.getAmountWithCOA();
    // await this.setdataCOA();
    // this.buildAmountAndChartOfAccountChart()
    //chart 4
    // await this.getAmountWithEvent();
    // await this.setdataForEvent();
    // this.buildAmountAndEventChart();


    await this.getAllCBInfo()
    await this.getList()
    await this.getChallan()
    await this.getAllUnPostedJournal()
  }

  randomColor() {
    for (let j = 0; j < 50; j++) {
      var letters = "0123456789ABCDEF";
      var color = '#';
      for (var i = 0; i < 6; i++)
        color += letters[(Math.floor(Math.random() * 16))];
      this.color.push(color)
    }
  }
  randomColor2() {
    for (let j = 0; j < 50; j++) {
      var letters = "0123456789ABCDEF";
      var color = '#';
      for (var i = 0; i < 6; i++)
        color += letters[(Math.floor(Math.random() * 16))];
      this.color2.push(color)
    }
  }
  allUnPostedJournalList = []
  all_jrnl_count: number;
  s4:boolean=false
  async getAllUnPostedJournal() {
    this.spinner.show()
    var resp = await this.ledgerService.getAllUnpostedJournalInfo(this.b_acct_id);
    if (resp['error'] == false) {
      this.s4=true
      for (let i = 0; i < resp['data'].length; i++) {
        let current_date = new Date()
        let current_month = current_date.getMonth()
        current_month = current_month + 1
        let comp_date = new Date(resp['data'][i]['acct_dt'])
        let comp_month = comp_date.getMonth()
        comp_month += 1
        if (current_month == comp_month) {
          this.allUnPostedJournalList.push(resp['data'][i])
        }
      }
      this.spinner.hide()
      this.all_jrnl_count = this.allUnPostedJournalList.length
    } else {
      this.spinner.hide()

    }
  }

  async getActiveFinYear() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getActiveFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp.data.length == 0) {
        swal.fire("Warning", "..Active Financial Year Not set!");
      } else {
        this.fin_year = resp.data[0].fin_year;
      }
    } else {
      swal.fire("Error", "..Error while getting active  fin year!");
    }
  }

  processingDate = ['2020-08-14', '2020-08-15', '2020-08-16', '2020-08-17', '2020-08-18', '2020-08-19', '2020-08-20', '2020-08-21'];
  processingDateAmount = [];
  async getAmountLast7Days() {
    var resp = await this.dashboardService.getamountwithprocessingdate(this.b_acct_id);
    if (resp['error'] == false) {
      this.processingDateAmount = resp.data['data'];
      this.dataPrctDate = resp.data['data'];
      this.processingDate = resp.data['date'];



      var data = [];
      var temp = [];

      for (let i = 0; i < this.processingDateAmount.length; i++) {
        if (temp.indexOf(this.processingDateAmount[i]['proc_dt'] + "(" + this.processingDateAmount[i]['db_cd_ind'] + ")") < 0) {
          temp.push(this.processingDateAmount[i]['proc_dt'] + "(" + this.processingDateAmount[i]['db_cd_ind'] + ")");
          var obj1 = new Object();
          if (this.processingDateAmount[i]['db_cd_ind'] == 'CR') {
            obj1['proc_dt'] = this.processingDateAmount[i]['proc_dt'] + "(" + this.processingDateAmount[i]['db_cd_ind'] + ")";
            obj1['cr_amount'] = this.processingDateAmount[i]['txn_amt'];
            obj1['db_amount'] = 0;
            obj1['db_cd_ind'] = this.processingDateAmount[i]['db_cd_ind'];
            obj1['date'] = this.processingDateAmount[i]['proc_dt'];
          } else {
            obj1['proc_dt'] = this.processingDateAmount[i]['proc_dt'] + "(" + this.processingDateAmount[i]['db_cd_ind'] + ")";
            obj1['db_amount'] = this.processingDateAmount[i]['txn_amt'];
            obj1['cr_amount'] = 0;
            obj1['db_cd_ind'] = this.processingDateAmount[i]['db_cd_ind'];
            obj1['date'] = this.processingDateAmount[i]['proc_dt'];


          }
          data.push(obj1);
        } else {
          var index = temp.indexOf(this.processingDateAmount[i]['proc_dt'] + "(" + this.processingDateAmount[i]['db_cd_ind'] + ")")
          if (this.processingDateAmount[i]['db_cd_ind'] == 'CR') {
            data[index]['cr_amount'] = data[index]['cr_amount'] + this.processingDateAmount[i]['txn_amt'];
          } else {
            data[index]['db_amount'] = data[index]['db_amount'] + this.processingDateAmount[i]['txn_amt'];
          }
        }

      }


      for (let i = 0; i < data.length; i++) {
        if (data[i]['db_cd_ind'] == 'CR') {
          data[i]['net_amount'] = data[i]['cr_amount']
        } else {
          data[i]['net_amount'] = (data[i]['db_amount']) * (-1)
        }
      }


      var data_temp = [];
      var flag_cr = false;
      var flag_db = false;
      for (let j = 0; j < this.processingDate.length; j++) {
        flag_cr = false;
        flag_db = false;
        for (let i = 0; i < data.length; i++) {
          if (data[i]['proc_dt'] == this.processingDate[j] + "(CR)") {
            flag_cr = true;
            data_temp.push(data[i]);
          } else if (data[i]['proc_dt'] == this.processingDate[j] + "(DB)") {
            flag_db = true;
            data_temp.push(data[i]);
          }
        }


        if (flag_cr == false && flag_db == false) {
          data_temp.push({ proc_dt: this.processingDate[j] + "(CR)", cr_amount: 0, db_amount: 0, net_amount: 0, db_cd_ind: 'CR', date: this.processingDate[j] })
          data_temp.push({ proc_dt: this.processingDate[j] + "(DB)", cr_amount: 0, db_amount: 0, net_amount: 0, db_cd_ind: 'DB', date: this.processingDate[j] })
        } else if (flag_cr == false) {
          data_temp.push({ proc_dt: this.processingDate[j] + "(CR)", cr_amount: 0, db_amount: 0, net_amount: 0, db_cd_ind: 'CR', date: this.processingDate[j] })
        } else if (flag_db == false) {
          data_temp.push({ proc_dt: this.processingDate[j] + "(DB)", cr_amount: 0, db_amount: 0, net_amount: 0, db_cd_ind: 'DB', date: this.processingDate[j] })
        }

      }
      this.processingDateAmount = data_temp;
    } else {
      swal.fire("Error", "..Error while getting amount with processing date!");
    }
  }
  // ----
  allCBInfo = []
  allCBCount: number;
  s1:boolean=false
  async getAllCBInfo() {
    this.spinner.show()
    var resp = await this.billService.getAllContingentBills(this.b_acct_id);
    if (resp['error'] == false) {
      this.s1=true
      for (let i = 0; i < resp['data'].length; i++) {
        let current_date = new Date()
        let current_month = current_date.getMonth()
        current_month = current_month + 1
        let comp_date = new Date(resp['data'][i]['cb_date'])
        let comp_month = comp_date.getMonth()
        comp_month += 1
        if (current_month == comp_month) {
          this.allCBInfo.push(resp['data'][i])
        }
      }
      this.spinner.hide()
      this.allCBCount = this.allCBInfo.length
    } else {
      this.spinner.hide();
      swal.fire("Error", "..Error while getting  all CB list!", 'error');

    }
  }

  allChallan = [];
  all_chalan_count: number;
  s3:boolean=false
  async getChallan() {
    this.spinner.show()
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.challanService.getChallanInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.s3=true
      for (let i = 0; i < resp['data'].length; i++) {
        let current_date = new Date()
        let current_month = current_date.getMonth()
        current_month = current_month + 1
        let comp_date = new Date(resp['data'][i]['challan_generate_date'])
        let comp_month = comp_date.getMonth()
        comp_month += 1
        if (current_month == comp_month) {
          this.allChallan.push(resp['data'][i])
        }
      }
      this.spinner.hide()
      this.all_chalan_count = this.allChallan.length
    } else {
      this.spinner.hide();
      swal.fire("Oops", "...Error while getting challan!", 'error');
    }
  }
  table_data = []
  allBP_count: number;
  s2:boolean=false
  async getList() {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.BPS.getList(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.s2=true
      for (let i = 0; i < resp['data'].length; i++) {
        let current_date = new Date()
        let current_month = current_date.getMonth()
        current_month = current_month + 1
        let comp_date = new Date(resp['data'][i]['bp_date'])
        let comp_month = comp_date.getMonth()
        comp_month += 1
        if (current_month == comp_month) {
          this.table_data.push(resp['data'][i])
        }
      }
      this.spinner.hide()
      this.allBP_count = this.table_data.length
    } else {
      this.spinner.hide()
      swal.fire("Error", "...Error while getting  all party list!", 'error');

    }
  }

  allTrialBalance = [];
  allTrialBalance1 = [];
  data = [];

  async getTrialBalance() {

    var obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['fin_year'] = this.fin_year;
    obj['acct_dt'] = this.systemDate;
    obj['proc_dt'] = this.systemDate;
    obj['ledger_type'] = 'A';
    var resp = await this.ledgerService.getTrailBalance(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.data = resp.data;
      var data = [];
      var temp = [];
      var Chart_of_account_type = [];

      for (let i = 0; i < this.data.length; i++) {
        if (temp.indexOf(this.data[i]['lvl3_code']) < 0) {
          temp.push(this.data[i]['lvl3_code']);
          Chart_of_account_type.push(this.data[i]['lvl3_value']);
          var obj1 = new Object();
          if (this.data[i]['db_cd_ind'] == 'CR') {
            obj1['lvl3_value'] = this.data[i]['lvl3_value'];
            obj1['lvl3_code'] = this.data[i]['lvl3_code'];
            obj1['cr_amount'] = this.data[i]['txn_amt'];
            obj1['db_amount'] = 0;
          } else {
            obj1['lvl3_value'] = this.data[i]['lvl3_value'];
            obj1['lvl3_code'] = this.data[i]['lvl3_code'];
            obj1['db_amount'] = this.data[i]['txn_amt'];
            obj1['cr_amount'] = 0;
          }
          data.push(obj1);
        } else {
          var index = temp.indexOf(this.data[i]['lvl3_code'])
          if (this.data[i]['db_cd_ind'] == 'CR') {
            data[index]['cr_amount'] = data[index]['cr_amount'] + this.data[i]['txn_amt'];
          } else {
            data[index]['db_amount'] = data[index]['db_amount'] + this.data[i]['txn_amt'];
          }
        }

      }


      for (let i = 0; i < data.length; i++) {

        // if (data[i]['lvl3_value'] == 'ASSET') {
        //   this.cr_asset = data[i]['cr_amount'];
        //   this.db_asset = data[i]['db_amount'];
        // }

        // if (data[i]['lvl3_value'] == 'LIABILITY') {
        //   this.cr_liability = data[i]['cr_amount'];
        //   this.db_liability = data[i]['db_amount'];
        // }

        // if (data[i]['lvl3_value'] == 'EQUITY') {
        //   this.cr_equity = data[i]['cr_amount'];
        //   this.db_equity = data[i]['db_amount'];
        // }

        // if (data[i]['lvl3_value'] == 'INCOME') {
        //   this.cr_income = data[i]['cr_amount'];
        //   this.db_income = data[i]['db_amount'];
        // }

        // if (data[i]['lvl3_value'] == 'EXPENSE') {
        //   this.cr_expense = data[i]['cr_amount'];
        //   this.db_expense = data[i]['db_amount'];
        // }

        var tt = data[i]['cr_amount'] - data[i]['db_amount'];
        if (tt < 0) {
          tt = tt * (-1)
        }
        data[i]['net_amount'] = tt
      }





      this.allTrialBalance1 = data;





      this.data = resp.data;
      var data = [];
      var temp = [];

      for (let i = 0; i < this.data.length; i++) {
        if (temp.indexOf(this.data[i]['lvl2_code']) < 0) {
          temp.push(this.data[i]['lvl2_code']);
          var obj1 = new Object();
          if (this.data[i]['db_cd_ind'] == 'CR') {
            obj1['lvl2_value'] = this.data[i]['lvl2_value'];
            obj1['lvl2_code'] = this.data[i]['lvl2_code'];
            obj1['cr_amount'] = this.data[i]['txn_amt'];
            obj1['db_amount'] = 0;
          } else {
            obj1['lvl2_value'] = this.data[i]['lvl2_value'];
            obj1['lvl2_code'] = this.data[i]['lvl2_code'];
            obj1['db_amount'] = this.data[i]['txn_amt'];
            obj1['cr_amount'] = 0;
          }
          data.push(obj1);
        } else {
          var index = temp.indexOf(this.data[i]['lvl2_code'])
          if (this.data[i]['db_cd_ind'] == 'CR') {
            data[index]['cr_amount'] = data[index]['cr_amount'] + this.data[i]['txn_amt'];
          } else {
            data[index]['db_amount'] = data[index]['db_amount'] + this.data[i]['txn_amt'];
          }
        }

      }
      for (let i = 0; i < data.length; i++) {
        data[i]['net_amount'] = data[i]['cr_amount'] - data[i]['db_amount']
      }
      this.allTrialBalance = data;

    } else {

    }
  }

  buildAmountAndChartOfAccountChartOnLvl2() {
    var dpTempObj = {};
    for (var i = 0; i < this.allTrialBalance.length; i++) {
      dpTempObj[this.allTrialBalance[i]['lvl2_value']] = this.allTrialBalance[i]['net_amount'];
    }
    var keys = Object.keys(dpTempObj)
    for (var i = 0; i < keys.length; i++) {
      this.mbarChartLabels2.push(keys[i]);
      this.barChartData2[0]['data'].push(dpTempObj[keys[i]])
    }
  }
  chart_of_account_name
  public chartClicked2(e: any): void {

    var index = e.active[0]._index;
    var gd = this.mbarChartLabels2[index];
    this.chart_of_account_name = gd;
    var selectedLevelData = [];
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i]['lvl2_value'] == gd) {
        selectedLevelData.push(this.data[i]);
      }
    }
    this.setSelectedAccountData(selectedLevelData);

    $('#myModal1').modal('show');
  }

  view1() {

    $('#myModalA').modal('show');

  }
  view2() {

    $('#myModalB').modal('show');

  }
  view3() {

    $('#myModalC').modal('show');

  }
  view4() {

    $('#myModalD').modal('show');

  }

  showArr = []
  async setSelectedAccountData(selectedLevelData) {
    this.showArr = [];

    var data = [];
    var temp = [];

    for (let i = 0; i < selectedLevelData.length; i++) {
      if (temp.indexOf(selectedLevelData[i]['leaf_code']) < 0) {
        temp.push(selectedLevelData[i]['leaf_code']);
        var obj1 = new Object();
        if (selectedLevelData[i]['db_cd_ind'] == 'CR') {
          obj1['chart_of_account'] = selectedLevelData[i]['leaf_value'];
          obj1['leaf_value'] = selectedLevelData[i]['leaf_value'];
          obj1['leaf_code'] = selectedLevelData[i]['leaf_code'];
          obj1['cr_amount'] = selectedLevelData[i]['txn_amt'];
          obj1['db_amount'] = 0;
        } else {
          obj1['chart_of_account'] = selectedLevelData[i]['leaf_value'];
          obj1['leaf_value'] = selectedLevelData[i]['leaf_value'];
          obj1['leaf_code'] = selectedLevelData[i]['leaf_code'];
          obj1['db_amount'] = selectedLevelData[i]['txn_amt'];
          obj1['cr_amount'] = 0;
        }
        data.push(obj1);
      } else {
        var index = temp.indexOf(selectedLevelData[i]['leaf_code'])
        if (selectedLevelData[i]['db_cd_ind'] == 'CR') {
          data[index]['cr_amount'] = data[index]['cr_amount'] + selectedLevelData[i]['txn_amt'];
        } else {
          data[index]['db_amount'] = data[index]['db_amount'] + selectedLevelData[i]['txn_amt'];
        }
      }

    }
    this.showArr = data;

  }
  buildAmountAndProcessingDate() {
    var dpTempObj = {};
    for (var i = 0; i < this.processingDateAmount.length; i++) {
      dpTempObj[this.processingDateAmount[i]['proc_dt']] = this.processingDateAmount[i]['net_amount'];
    }

    var keys = Object.keys(dpTempObj)

    for (var i = 0; i < keys.length; i++) {
      this.mbarChartLabels3.push(keys[i]);
      this.barChartData3[0]['data'].push(dpTempObj[keys[i]])
    }
  }

  showArr1 = [];
  public chartClicked3(e: any): void {
    this.cr_amount = 0;
    this.db_amount = 0;
    var index = e.active[0]._index;
    var gd = this.mbarChartLabels3[index];
    this.chart_of_account_name = gd;
    this.showArr1 = [];
    for (let j = 0; j < this.dataPrctDate.length; j++) {
      if (this.dataPrctDate[j]['proc_dt'] + "(" + this.dataPrctDate[j]['db_cd_ind'] + ")" == gd) {
        this.showArr1.push(this.dataPrctDate[j])
      }
    }
    $('#myModal2').modal('show');
  }

  public mbarChartLabels: string[] = [];
  public mbarChartLabels1: string[] = [];
  public mbarChartLabels2: string[] = [];
  public mbarChartLabels3: string[] = [];

  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;
  public barChartColors1: Array<any> = [
    {
      backgroundColor: this.color,
      borderColor: this.color[1],
      pointBackgroundColor: this.color[1],
      pointBorderColor: this.color[1],
      pointHoverBackgroundColor: this.color[1],
      pointHoverBorderColor: this.color[1]
    },
    {
      backgroundColor: this.color,
      borderColor: this.color[1],
      pointBackgroundColor: this.color[1],
      pointBorderColor: this.color[1],
      pointHoverBackgroundColor: this.color[1],
      pointHoverBorderColor: this.color[1],
    }
  ];
  public barChartColors2: Array<any> = [
    {
      backgroundColor: this.color2,
      borderColor: this.color2[1],
      pointBackgroundColor: this.color2[1],
      pointBorderColor: this.color2[1],
      pointHoverBackgroundColor: this.color2[1],
      pointHoverBorderColor: this.color2[1]
    },
    {
      backgroundColor: this.color2,
      borderColor: this.color2[1],
      pointBackgroundColor: this.color2[1],
      pointBorderColor: this.color2[1],
      pointHoverBackgroundColor: this.color2[1],
      pointHoverBorderColor: this.color2[1],
    }
  ];
  //   var randomColorGenerator = function () { 
  //     return '#' + (Math.random().toString(16) + '0000000').slice(2, 8); 
  // };
  public barChartData: any[] = [
    { data: [], label: 'EVENT' },
  ];
  public barChartData1: any[] = [
    { data: [], label: 'CHART OF ACCOUNT' },
  ];
  public barChartData2: any[] = [
    { data: [], label: 'CHART OF ACCOUNT' },
  ];
  public barChartData3: any[] = [
    { data: [], label: 'PROCESSING DATE' },
  ];





  eventObj = {};
  coaObj = {};
  cr_amount = 0;
  db_amount = 0;

  async getAmountWithEvent() {
    var resp = await this.dashboardService.getamountwithevent(this.erpUser.b_acct_id);
    if (resp['error'] == false) {
      if (resp.data.length > 0) {
        this.allEVENT = resp.data;
      }
      this.eventObj = {};
      for (let i = 0; i < this.allEVENT.length; i++) {
        this.eventObj[this.allEVENT[i]['event_code']] = this.allEVENT[i]['event_desc']
      }

    } else {

    }
  }
  async getAmountWithCOA() {
    var resp = await this.dashboardService.getamountwithcoa(this.erpUser.b_acct_id);
    if (resp['error'] == false) {
      if (resp.data.length > 0) {
        this.allCOA = resp.data;
      }

      this.coaObj = {};
      for (let i = 0; i < this.allCOA.length; i++) {
        this.coaObj[this.allCOA[i]['chart_of_account']] = this.allCOA[i]['leaf_value']
      }
    } else {

    }
  }

  setdataForEvent() {


    var data = [];
    var temp = [];

    for (let i = 0; i < this.allEVENT.length; i++) {
      if (temp.indexOf(this.allEVENT[i]['event_code']) < 0) {
        temp.push(this.allEVENT[i]['event_code']);
        var obj1 = new Object();
        if (this.allEVENT[i]['db_cd_ind'] == 'CR') {
          obj1['event_code'] = this.allEVENT[i]['event_code'];
          obj1['event_desc'] = this.allEVENT[i]['event_desc'];
          obj1['cr_amount'] = this.allEVENT[i]['txn_amt'];
          obj1['db_amount'] = 0;
        } else {
          obj1['event_code'] = this.allEVENT[i]['event_code'];
          obj1['event_desc'] = this.allEVENT[i]['event_desc'];
          obj1['db_amount'] = this.allEVENT[i]['txn_amt'];
          obj1['cr_amount'] = 0;
        }
        data.push(obj1);
      } else {
        var index = temp.indexOf(this.allEVENT[i]['event_code'])
        if (this.allEVENT[i]['db_cd_ind'] == 'CR') {
          data[index]['cr_amount'] = data[index]['cr_amount'] + this.allEVENT[i]['txn_amt'];
        } else {
          data[index]['db_amount'] = data[index]['db_amount'] + this.allEVENT[i]['txn_amt'];
        }
      }

    }


    for (let i = 0; i < data.length; i++) {
      data[i]['net_amount'] = data[i]['cr_amount'] - data[i]['db_amount']
    }
    this.allEVENT = data;

  }

  setdataCOA() {


    var data = [];
    var temp = [];

    for (let i = 0; i < this.allCOA.length; i++) {
      if (temp.indexOf(this.allCOA[i]['chart_of_account']) < 0) {
        temp.push(this.allCOA[i]['chart_of_account']);
        var obj1 = new Object();
        if (this.allCOA[i]['db_cd_ind'] == 'CR') {
          obj1['chart_of_account'] = this.allCOA[i]['chart_of_account'];
          obj1['leaf_value'] = this.allCOA[i]['leaf_value'];
          obj1['cr_amount'] = this.allCOA[i]['txn_amt'];
          obj1['db_amount'] = 0;
        } else {
          obj1['chart_of_account'] = this.allCOA[i]['chart_of_account'];
          obj1['leaf_value'] = this.allCOA[i]['leaf_value'];
          obj1['db_amount'] = this.allCOA[i]['txn_amt'];
          obj1['cr_amount'] = 0;
        }
        data.push(obj1);
      } else {
        var index = temp.indexOf(this.allCOA[i]['chart_of_account'])
        if (this.allCOA[i]['db_cd_ind'] == 'CR') {
          data[index]['cr_amount'] = data[index]['cr_amount'] + this.allCOA[i]['txn_amt'];
        } else {
          data[index]['db_amount'] = data[index]['db_amount'] + this.allCOA[i]['txn_amt'];
        }
      }

    }


    for (let i = 0; i < data.length; i++) {
      data[i]['net_amount'] = data[i]['cr_amount'] - data[i]['db_amount']
    }
    this.allCOA = data;

  }

  buildAmountAndEventChart() {
    var dp = [];
    var dpTempObj = {};
    for (var i = 0; i < this.allEVENT.length; i++) {
      dpTempObj[this.allEVENT[i]['event_code']] = this.allEVENT[i]['net_amount'];
    }
    var keys = Object.keys(dpTempObj)
    for (var i = 0; i < keys.length; i++) {
      this.mbarChartLabels.push(this.eventObj[keys[i]]);
      this.barChartData[0]['data'].push(dpTempObj[keys[i]])
    }

  }
  public chartClicked(e: any): void {
    this.cr_amount = 0;
    this.db_amount = 0;
    var index = e.active[0]._index;
    var gd = this.mbarChartLabels[index];
    this.chart_of_account_name = gd;

    for (var i = 0; i < this.allEVENT.length; i++) {
      if (this.allEVENT[i]['event_desc'] == gd) {
        this.cr_amount = this.allEVENT[i]['cr_amount'];
        this.db_amount = this.allEVENT[i]['db_amount'];
      }
    }
    $('#myModal').modal('show');
  }

  buildAmountAndChartOfAccountChart() {
    var dpTempObj = {};
    for (var i = 0; i < this.allCOA.length; i++) {
      dpTempObj[this.allCOA[i]['chart_of_account']] = this.allCOA[i]['net_amount'];
    }
    var keys = Object.keys(dpTempObj)
    for (var i = 0; i < keys.length; i++) {
      this.mbarChartLabels1.push(this.coaObj[keys[i]]);
      this.barChartData1[0]['data'].push(dpTempObj[keys[i]])
    }
  }
  public chartClicked1(e: any): void {
    this.cr_amount = 0;
    this.db_amount = 0;
    var index = e.active[0]._index;
    var gd = this.mbarChartLabels1[index];
    this.chart_of_account_name = gd;
    for (var i = 0; i < this.allCOA.length; i++) {
      if (this.allCOA[i]['leaf_value'] == gd) {
        this.cr_amount = this.allCOA[i]['cr_amount'];
        this.db_amount = this.allCOA[i]['db_amount'];
      }
    }
    $('#myModal').modal('show');
  }

}
