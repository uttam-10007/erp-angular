import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgtreegridComponent } from 'ngtreegrid';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { LedgerService } from '../../../service/ledger.service';
import { MainService } from '../../../service/main.service';
import { element } from 'protractor';
import * as WebDataRocks from "webdatarocks";
declare var $: any

@Component({
  selector: 'app-adhoc-report',
  templateUrl: './adhoc-report.component.html',
  styleUrls: ['./adhoc-report.component.css'],
})

export class AdhocReportComponent implements OnInit {
  tabledata: any[] = [];


  configs={};
  
  erpUser;
  b_acct_id;
  
  level1Arr = []
  level2Arr = []
  level3Arr = []
  level4Arr = []
  level5Arr = []

  allFinYear;

  obj = {};


  allChartOfAccount
  AllPartyObj = {};
  allParty = [];
  allAccountInfo = [];
  AllAccountObj = {};


  fields = [{ tech_name: 'jrnl_detail_line_id', bus_name: 'Journal Detail Line ID' }, { tech_name: 'jrnl_line_id', bus_name: 'Journal Line ID' },
  { tech_name: 'jrnl_desc', bus_name: 'Journal Description' }, { tech_name: 'fin_year', bus_name: 'Financeal Year' }
    , { tech_name: 'debit_credit_ind', bus_name: 'Debit Credit Indicater' }, { tech_name: 'acct_num', bus_name: 'Account Number' }
    , { tech_name: 'party_id', bus_name: 'Party ID' }, { tech_name: 'event_code', bus_name: 'Account Head' }
    , { tech_name: 'accounting_dt', bus_name: 'Accounting Date' }, { tech_name: 'processing_dt', bus_name: 'Processing Date' }
    , { tech_name: 'party_legal_name', bus_name: 'Party Name' }, { tech_name: 'party_origination_source_code', bus_name: 'Party Origination Source Code' }
    , { tech_name: 'party_type_code', bus_name: 'Party Type Code' }, { tech_name: 'party_gst_no', bus_name: 'Party GST Number' }
    , { tech_name: 'party_adhaar_no', bus_name: 'Party Adhaar Number' }, { tech_name: 'party_pan_no', bus_name: 'Party Pan Number' }
    , { tech_name: 'party_phone_no', bus_name: 'Party Phone Number' }, { tech_name: 'party_email', bus_name: 'Party Email' }
    , { tech_name: 'party_city', bus_name: 'Party City' }, { tech_name: 'party_district', bus_name: 'Party District' }
    , { tech_name: 'party_addr_line1', bus_name: 'Party Address Line1' }, { tech_name: 'party_addr_line2', bus_name: 'Party Address Line2' }
    , { tech_name: 'party_state', bus_name: 'Party State' }, { tech_name: 'party_country', bus_name: 'Party Country' }
    , { tech_name: 'party_pin_code', bus_name: 'Party Pin Code' }, { tech_name: 'party_bank_acct_no', bus_name: 'Party Bank Account Number' }
    , { tech_name: 'party_branch_code', bus_name: 'Party Branch Code' }, { tech_name: 'party_bank_code', bus_name: 'Party Bank Code' }
    , { tech_name: 'party_ifsc_code', bus_name: 'Party IFSC Code' }, { tech_name: 'party_local_no', bus_name: 'Party Local Number' }
    , { tech_name: 'lvl1_code', bus_name: 'Level 1 Code' }, { tech_name: 'lvl1_value', bus_name: 'Level 1 Value' }
    , { tech_name: 'lvl2_code', bus_name: 'Level 2 Code' }, { tech_name: 'lvl2_value', bus_name: 'Level 2 Value' }
    , { tech_name: 'lvl3_code', bus_name: 'Level 3 Code' }, { tech_name: 'lvl3_value', bus_name: 'Level 3 Value' }
    , { tech_name: 'lvl4_code', bus_name: 'Level 4 Code' }, { tech_name: 'lvl4_value', bus_name: 'Level 4 Value' }
    , { tech_name: 'lvl5_code', bus_name: 'Level 5 Code' }, { tech_name: 'lvl5_value', bus_name: 'Level 5 Value' }
  ];

  coaArr = ['lvl1_value', 'lvl1_code', 'lvl2_value', 'lvl2_code', 'lvl3_value', 'lvl3_code', 'lvl4_value', 'lvl4_code', 'lvl5_value',
    'lvl5_code']

  jrnlArr = ['processing_dt', 'event_code', 'acct_num', 'fin_year', 'jrnl_line_id', 'accounting_dt', 'party_id', 'debit_credit_ind',
    'jrnl_desc', 'jrnl_detail_line_id']

  partyArr = ['party_local_no', 'party_bank_code', 'party_bank_acct_no', 'party_country', 'party_addr_line2', 'party_district', 'party_email',
    'party_pan_no', 'party_gst_no', 'party_origination_source_code', 'party_branch_code', 'party_legal_name', 'party_type_code',
    'party_adhaar_no', 'party_phone_no', 'party_city', 'party_addr_line1', 'party_state', 'party_pin_code', 'party_ifsc_code']

  //   multilevel_products: any[] = [
  //     { product_type: 'Book', name: 'Angular', price: 90,weight:23, marketer: 'XY', author: 'Sam' },
  //     { product_type: 'Book', name: 'Python', price: 70,weight:24, marketer: 'XY', author: 'Lam' },
  //     { product_type: 'Book', name: 'PHP', price: 80,weight:25, marketer: 'XY', author: 'Sam' },
  //     { product_type: 'Book', name: 'Java', price: 50, weight:26,marketer: 'AB', author: 'Lam' },
  //     { product_type: 'Electronic', name: 'Mouse', price: 50,weight:43, marketer: 'AB', author: 'Sam' },
  //     { product_type: 'Electronic', name: 'Earphone', price: 20,weight:53, marketer: 'XY', author: 'Lam' },
  //     { product_type: 'Electronic', name: 'Head Phone', price: 40,weight:20, marketer: 'XY', author: 'Lam' },
  //     { product_type: 'Electronic', name: 'Speaker', price: 45, weight:241,marketer: 'AB', author: 'Lam' },
  //     { product_type: 'Electronic', name: 'Hard Drive', price: 55,weight:21, marketer: 'XY', author: 'Lam'}
  //   ];
  //   multilelvel_configs: any = {
  //     'group_by': ['product_type', 'marketer', 'author'],
  //     'group_by_header': ['Product Type', 'Marketer', 'Author'],
  //     'group_by_width': '100px',
  //     'data_loading_text': 'Loading data...',
  //     'actions': {
  //       'add': true,
  //       'edit': true,
  //       'delete': true
  //     },
  //     'columns': [{
  //       'header': 'Product Name',
  //       'name': 'name',
  //       'sortable': false,
  //       'editable': true
  //     }, {
  //       'header': 'Price',
  //       'name': 'price',
  //       'width': '200px',
  //       'editable': true,
  //       'group_aggregator': (array) => {
  //         const prices = array.map((item) => item.price);
  //         return '$' + prices.reduce((acc, item) => Number(acc) + Number(item));
  //       },

  //     }
  //  ,]
  //   };



  


  constructor(public mainService: MainService, private ledgerService: LedgerService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  @ViewChild(NgtreegridComponent, { static: true }) angularGrid: NgtreegridComponent;

  async ngOnInit() {

    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getallChartOfAccount();
    await this.getAllFinYear();

  }

  collapseAll() {
    this.angularGrid.collapseAll();
  }

  expandAll() {
    this.angularGrid.expandAll();
  }

  async getAllFinYear() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getAllFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allFinYear = resp.data;
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all fin year list", 'Error', {
        duration: 5000
      });
    }
  }
  async getallChartOfAccount() {
    this.spinner.show()
    this.allChartOfAccount = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getchartofaccount(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      this.level1Arr = []
      this.level2Arr = []
      this.level3Arr = []
      this.level4Arr = []
      this.level5Arr = []

      var level1Temp = new Set();
      var level2Temp = new Set();
      var level3Temp = new Set();
      var level4Temp = new Set();
      var level5Temp = new Set();

      for (let i = 0; i < this.allChartOfAccount.length; i++) {
        if (!level1Temp.has(this.allChartOfAccount[i]['lvl1_code'])) {
          level1Temp.add(this.allChartOfAccount[i]['lvl1_code'])
          let obj1 = Object.assign({}, { "code": this.allChartOfAccount[i]['lvl1_code'], "value": this.allChartOfAccount[i]['lvl1_value'] })
          this.level1Arr.push(obj1)
        }
        if (!level2Temp.has(this.allChartOfAccount[i]['lvl2_code'])) {
          level2Temp.add(this.allChartOfAccount[i]['lvl2_code'])
          this.level2Arr.push({ code: this.allChartOfAccount[i]['lvl2_code'], value: this.allChartOfAccount[i]['lvl2_value'] })
        }
        if (!level3Temp.has(this.allChartOfAccount[i]['lvl3_code'])) {
          level3Temp.add(this.allChartOfAccount[i]['lvl3_code'])
          this.level3Arr.push({ code: this.allChartOfAccount[i]['lvl3_code'], value: this.allChartOfAccount[i]['lvl3_value'] })
        }
        if (!level4Temp.has(this.allChartOfAccount[i]['lvl4_code'])) {
          level4Temp.add(this.allChartOfAccount[i]['lvl4_code'])
          this.level4Arr.push({ code: this.allChartOfAccount[i]['lvl4_code'], value: this.allChartOfAccount[i]['lvl4_value'] })
        }
        if (!level5Temp.has(this.allChartOfAccount[i]['lvl5_code'])) {
          level5Temp.add(this.allChartOfAccount[i]['lvl5_code'])
          this.level5Arr.push({ code: this.allChartOfAccount[i]['lvl5_code'], value: this.allChartOfAccount[i]['lvl5_value'] })
        }
      }
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all chart of account info", 'Error', {
        duration: 5000
      });
    }
  }
  async submit() {
    var obj = new Object;
    obj['filter'] = new Object;
    obj['b_acct_id'] = this.b_acct_id
    if (this.obj['lvl1_code'] != undefined) {
      if (this.obj['lvl1_code'] != null) {
        obj['filter']['lvl1_code'] = this.obj['lvl1_code']
      }
    }
    if (this.obj['lvl2_code'] != undefined) {
      if (this.obj['lvl2_code'] != null) {
        obj['filter']['lvl2_code'] = this.obj['lvl2_code']
      }
    }
    if (this.obj['lvl3_code'] != undefined) {
      if (this.obj['lvl3_code'] != null) {
        obj['filter']['lvl3_code'] = this.obj['lvl3_code']
      }
    }
    if (this.obj['lvl4_code'] != undefined) {
      if (this.obj['lvl4_code'] != null) {
        obj['filter']['lvl4_code'] = this.obj['lvl4_code']
      }
    }
    if (this.obj['lvl5_code'] != undefined) {
      if (this.obj['lvl5_code'] != null) {
        obj['filter']['lvl5_code'] = this.obj['lvl5_code']
      }
    }
    if (this.obj['accounting_dt'] != undefined) {
      if (this.obj['accounting_dt'] != "") {
        obj['filter']['accounting_dt'] = this.obj['accounting_dt']
      }
    }
    if (this.obj['fin_year'] != undefined) {
      if (this.obj['fin_year'] != null) {
        obj['filter']['fin_year'] = this.obj['fin_year']
      }
    }
    obj['project_field'] = []
    var arr = this.obj['fields']
    for (let i = 0; i < arr.length; i++) {
      if (this.partyArr.includes(arr[i])) {
        obj['project_field'].push({ "field": arr[i], "table": "party_info" })
      }
      if (this.jrnlArr.includes(arr[i])) {
        obj['project_field'].push({ "field": arr[i], "table": "jrnl" })
      }
      if (this.coaArr.includes(arr[i])) {
        obj['project_field'].push({ "field": arr[i], "table": "chart_of_account" })
      }
    }

var arr_tech=[];
    for(let i=0;i<arr.length;i++){
      for(let j=0;j<this.fields.length;j++){
        if(arr[i]==this.fields[j].tech_name){
          arr_tech.push(this.fields[j].bus_name);
        }
      }
    }
   
    this.configs = {
      'columns': [{
        'header': 'Amount',
        'name': 'amount',
        'width': '200px',
        'renderer': (value, rec) => {
          return '' + value;
        },
        'group_aggregator': (array) => {
          const amounts = array.map((item) => item.amount);
          return '' + amounts.reduce((acc, item) => Number(acc) + Number(item));
        }
      }
      ],
      css: { // Optional
        expand_class: 'fa fa-caret-right',
        collapse_class: 'fa fa-caret-down',
      },

      
       'group_by': arr,
       'group_by_header':arr_tech,
       'group_by_width': '100px'
  
      /* 'group_by': ['lvl1_value', 'lvl2_value', 'lvl3_value', 'lvl4_value', 'lvl5_value',],
      'group_by_header': ['Level 1 Value', 'Level 2 Value', 'Level 3 Value', 'Level 4 Value', 'Level 5 Value'],
      'group_by_width': '100px' */
    };


    var resp = await this.ledgerService.getAdhocReport(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tabledata = resp.data;

      var pivot = new WebDataRocks({
        container: "#wdr-component",
        toolbar: true,
        height: 395,
        report: {
          dataSource: {
            data: this.tabledata
          }
        }
      });


    } else {
      this.tabledata = [];
    }

  }
}