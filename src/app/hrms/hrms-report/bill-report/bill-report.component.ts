import { Component, OnInit, ViewChild, KeyValueDiffers } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import {ExcelService} from '../../service/file-export.service';
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';
import { EstablishmentService } from '../../service/establishment.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { ApprService } from '../../service/appr.service';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-bill-report',
  templateUrl: './bill-report.component.html',
  styleUrls: ['./bill-report.component.css']
})
export class BillReportComponent implements OnInit {

  constructor(private excl:ExcelService,private apprService: ApprService, private establishmentService: EstablishmentService, public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  allBillId = [];
  monthObj = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }
  monthEnd = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 }

  currentBillObj = { header: {}, allEmployees: [], data: {}, sums: {} };

  currentBillObj_temp = { header: {}, allSetionCode: [], data: {}, sums: {} };
  billIdObj = {};
  b_acct_id;
  dataSource1;
  allBillData = []
  allEmplyees = []
  allCurrentArrangements = []
  salaryObj = { accrual_date: '', b_acct_id: '', fin_year: '', month: '', section_code: '', post_info: {}, emp_info: {}, employement_info: {}, bank_info: {}, att_info: {}, fixed_pay_info: {}, variable_pay_info: {}, total_pay: {} }
  erpUser;
  displayedColumns1 = ['bill_id', 'bill_desc', 'bill_status_code', 'bill_date', 'print'];
  selectObj={}
  @ViewChild(MatPaginator, { static: true }) paginator1: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort1: MatSort;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllEmployees();
    await this.getAllActiveEmployees();
  }

  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async getAllBillID() {
    var obj = new Object();
    this.billIdObj['b_acct_id'] = this.b_acct_id;

    var resp = await this.payableService.getbillbydate(JSON.stringify(this.billIdObj));
    if (resp['error'] == false) {
      this.allBillId = resp.data;
      for (let i = 0; i < this.allBillId.length; i++) {
        this.allBillId[i]['tempaccrual_date'] = this.mainService.dateformatchange(this.allBillId[i]['accrual_date'])
        
      }
      this.dataSource1 = new MatTableDataSource(this.allBillId);
      this.dataSource1.paginator = this.paginator1
      this.dataSource1.sort = this.sort1;
    } else {
      this.snackBar.open("Error in getting All Bill", 'Error', {
        duration: 5000
      });
    }
  }
  async getAllBill(element,type){
    this.currentBillObj ={header:{},allEmployees:[],data:{},sums:{}};

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['bill_id'] = element['bill_id'];
    this.spinner.show()
    var resp = await this.payableService.getAllBill(JSON.stringify(obj));
    if(resp['error']==false){
      var billObj={};
      var header="";
      var dt =  resp['data'];
      console.log(dt)
      if(dt.length>0){
        header = dt[0];
      }
      var grand=undefined;
      var month="";
      var fin_year="";
      var fixedarr = []
      for(var i=0;i<dt.length;i++){
        //header = dt[0];
        if(billObj[dt[i]['section_code']]==undefined){
          month = dt[i]['month'];
          fin_year = dt[i]['fin_year'];
          billObj[dt[i]['section_code']]={};
          billObj[dt[i]['section_code']]['data']={};//{'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[]};
          billObj[dt[i]['section_code']]['total']={'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          if(grand == undefined){
            grand = {'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          }
        }
        if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']] == undefined){
          fixedarr = []
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']] = {emp_id:'',emp_name:'',designation_code:'',grade_pay_code:'',pay_band:'',sal_acc:'',pf:'',pf_ifsc:'','BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,'NPS':0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['emp_id']="VDA"+this.getNumberFormat(dt[i]['emp_id']);
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['emp_name']=this.salaryObj.emp_info[dt[i].emp_id]['emp_name'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['designation_code']=this.salaryObj.employement_info[dt[i].emp_id]['designation_code'];;
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['grade_pay_code']="GP "+this.salaryObj.employement_info[dt[i].emp_id]['grade_pay_code'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pay_band']='PB '+'('+this.salaryObj.employement_info[dt[i].emp_id]['pay_scale_code']+')';
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['sal_acc']=this.salaryObj.emp_info[dt[i].emp_id]['acct_no'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pf']=this.salaryObj.emp_info[dt[i].emp_id]['pf_acct_no'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['pf_ifsc']=this.salaryObj.emp_info[dt[i].emp_id]['pf_ifsc_code'];
        }
     
        if(dt[i]['pay_code'] =='PAY'){
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['total'] +=dt[i]['pay_component_amt']; 
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] +=dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['total']['total'] +=dt[i]['pay_component_amt']; 
          billObj[dt[i]['section_code']]['total']['net'] +=dt[i]['pay_component_amt'];
          grand['total'] +=dt[i]['pay_component_amt']; 
          grand['net'] +=dt[i]['pay_component_amt']; 
          if(!fixedarr.includes(dt[i]['pay_component_code'])){
            fixedarr.push(dt[i]['pay_component_code'])
          if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]!=undefined){
            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
            grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
          }else{
            billObj[dt[i]['section_code']]['total']['miscpay'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
            grand['miscpay'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['miscpay'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
          }
        }else{            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

          if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] == undefined){
          var temp = grand[dt[i]['pay_component_code']]
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] = []
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push( billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']])
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])

          grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

          }else{
            grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])
          }

        }
        }else{
          if(!fixedarr.includes(dt[i]['pay_component_code'])){
            fixedarr.push(dt[i]['pay_component_code'])
          billObj[dt[i]['section_code']]['total']['net'] -=dt[i]['pay_component_amt'];
          grand['net'] -=dt[i]['pay_component_amt'];
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] -=dt[i]['pay_component_amt'];
          if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]!=undefined){
            billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
            grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
          }else{
            billObj[dt[i]['section_code']]['total']['miscded'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
            grand['miscded'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});

            billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['miscded'].push({code:dt[i]['pay_component_code'],amount:dt[i]['pay_component_amt']});
          }
        }else{     
        billObj[dt[i]['section_code']]['total'][dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
        billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']]['net'] -=dt[i]['pay_component_amt'];
        if(billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] == undefined){
        var temp = grand[dt[i]['pay_component_code']]
        billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"] = []
       billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push( billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']])
        billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])
  
        grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
  
        }else{
          grand[dt[i]['pay_component_code']]+=dt[i]['pay_component_amt'];
  
          billObj[dt[i]['section_code']]['data'][dt[i]['emp_id']][dt[i]['pay_component_code']+"_arr"].push(dt[i]['pay_component_amt'])
        }
  
      }
        }
    
     
      }
      if(type=='bill'){
        console.log(fixedarr)
        console.log(billObj,header,grand,month,fin_year)
        this.print(billObj,header,grand,month,fin_year);

      }
      else{
        this.print1(billObj,header,grand,month,fin_year);
      }
      this.spinner.hide()
    }else{
      this.spinner.hide();
      swal.fire("Error","Error while printing pay bill",'error')
    }
  }


  async getAllBill1(element) {
    this.currentBillObj = { header: {}, allEmployees: [], data: {}, sums: {} };

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['bill_id'] = element['bill_id'];
    var resp = await this.payableService.getAllBill(JSON.stringify(obj));

    if (resp['error'] == false) {
      this.allBillData = resp.data;
      var total = 0;
      if (this.allBillData.length > 0) {
        this.currentBillObj['header'] = this.allBillData[0];
      }
      if (this.currentBillObj['header']['month'] == 1 || this.currentBillObj['header']['month'] == 2 || this.currentBillObj['header']['month'] == 3) {
        this.currentBillObj['header']['year'] = this.currentBillObj['header']['fin_year'] + 1
      } else {
        this.currentBillObj['header']['year'] = this.currentBillObj['header']['fin_year']

      }
      var ob = {}

      for (var i = 0; i < this.allBillData.length; i++) {
        if (ob[this.allBillData[i]['emp_id']] == undefined) {
          this.currentBillObj.allEmployees.push(this.allBillData[i]['emp_id']);
          ob[this.allBillData[i]['emp_id']] = {};
          ob[this.allBillData[i]['emp_id']]['payable'] = [];
          ob[this.allBillData[i]['emp_id']]['deduction'] = [];
          ob[this.allBillData[i]['emp_id']]['personal_info'] = {};
          ob[this.allBillData[i]['emp_id']]['bank_info'] = {};
          ob[this.allBillData[i]['emp_id']]['gross_pay'] = 0
          ob[this.allBillData[i]['emp_id']]['ded'] = 0
          ob[this.allBillData[i]['emp_id']]['net'] = 0;
          ob[this.allBillData[i]['emp_id']]['CONT'] = 0
          //personal Info
          ob[this.allBillData[i]['emp_id']]['personal_info']['emp_id'] = this.allBillData[i]['emp_id'];
          ob[this.allBillData[i]['emp_id']]['personal_info']['emp_name'] = this.salaryObj.emp_info[this.allBillData[i].emp_id]['emp_name'];
          ob[this.allBillData[i]['emp_id']]['personal_info']['emp_phone_no'] = this.salaryObj.emp_info[this.allBillData[i].emp_id]['emp_phone_no'];
          ob[this.allBillData[i]['emp_id']]['personal_info']['grade_pay_code'] = this.salaryObj.employement_info[this.allBillData[i].emp_id]['grade_pay_code'];
          ob[this.allBillData[i]['emp_id']]['personal_info']['pay_scale_code'] = this.salaryObj.employement_info[this.allBillData[i].emp_id]['pay_scale_code'];
          ob[this.allBillData[i]['emp_id']]['personal_info']['pay_commission_code'] = this.salaryObj.employement_info[this.allBillData[i].emp_id]['pay_commission_code'];
          ob[this.allBillData[i]['emp_id']]['personal_info']['designation_code'] = this.salaryObj.employement_info[this.allBillData[i].emp_id]['designation_code'];
          //bank Info
          ob[this.allBillData[i]['emp_id']]['personal_info']['num_of_days'] = this.allBillData[i].num_of_days;


          ob[this.allBillData[i]['emp_id']]['bank_info']['emp_pan_no'] = this.salaryObj.emp_info[this.allBillData[i].emp_id]['emp_pan_no'];

          ob[this.allBillData[i]['emp_id']]['bank_info']['bank_name'] = this.mainService.codeValueShowObj['HR0001'][this.salaryObj.emp_info[this.allBillData[i].emp_id]['bank_code']];
          ob[this.allBillData[i]['emp_id']]['bank_info']['branch_name'] = this.mainService.codeValueShowObj['HR0002'][this.salaryObj.emp_info[this.allBillData[i].emp_id]['branch_code']];

          ob[this.allBillData[i]['emp_id']]['bank_info']['ifsc_code'] = this.mainService.codeValueShowObj['HR0003'][this.salaryObj.emp_info[this.allBillData[i].emp_id]['ifsc_code']];
          ob[this.allBillData[i]['emp_id']]['bank_info']['acct_no'] = this.salaryObj.emp_info[this.allBillData[i].emp_id]['acct_no'];
          ob[this.allBillData[i]['emp_id']]['bank_info']['pf_acct_no'] = this.salaryObj.emp_info[this.allBillData[i].emp_id]['pf_acct_no'];

        }
        if (this.allBillData[i].pay_code == 'PAY') {
          ob[this.allBillData[i]['emp_id']]['gross_pay'] += this.allBillData[i].pay_component_amt
          ob[this.allBillData[i]['emp_id']]['net'] += this.allBillData[i].pay_component_amt;
          ob[this.allBillData[i]['emp_id']]['payable'].push(this.allBillData[i]);
          total += this.allBillData[i].pay_component_amt
          ob[this.allBillData[i]['emp_id']]['gross_pay'] = parseFloat((ob[this.allBillData[i]['emp_id']]['gross_pay']).toFixed(2))
          ob[this.allBillData[i]['emp_id']]['net'] = parseFloat((ob[this.allBillData[i]['emp_id']]['net']).toFixed(2))
        } else if (this.allBillData[i].pay_code == 'DED') {

          ob[this.allBillData[i]['emp_id']]['ded'] += this.allBillData[i].pay_component_amt
          ob[this.allBillData[i]['emp_id']]['net'] -= this.allBillData[i].pay_component_amt;
          ob[this.allBillData[i]['emp_id']]['deduction'].push(this.allBillData[i])
          total -= this.allBillData[i].pay_component_amt
          ob[this.allBillData[i]['emp_id']]['ded'] = parseFloat((ob[this.allBillData[i]['emp_id']]['ded']).toFixed(2))
          ob[this.allBillData[i]['emp_id']]['net'] = parseFloat((ob[this.allBillData[i]['emp_id']]['net']).toFixed(2))
        } else {
          ob[this.allBillData[i]['emp_id']]['CONT'] = this.allBillData[i].pay_component_amt;
        }






      }
      this.currentBillObj['header']['total'] = parseFloat(total.toFixed(2));
      this.currentBillObj.data = ob;
      $('.nav-tabs a[href="#tab-2"]').tab('show');

    } else {
      this.snackBar.open("Error while getting Salary Bill", 'Error', {
        duration: 5000
      });
    }
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getEmployeeMasterData(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allEmplyees = resp.data;
      for (var i = 0; i < this.allEmplyees.length; i++) {
        this.salaryObj.emp_info[this.allEmplyees[i].emp_id] = this.allEmplyees[i];
      }
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }

  async getAllActiveEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    // obj['emp_status_code'] = ['ACTIVE']
    var resp = await this.payableService.getArrayAllCurrentEstablishementInfo(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allCurrentArrangements = resp['data'];
      for (var i = 0; i < this.allCurrentArrangements.length; i++) {
        this.salaryObj.employement_info[this.allCurrentArrangements[i].emp_id] = this.allCurrentArrangements[i];

      }

    }else{
      this.spinner.hide()
    }
  }
 
  print(billObj,header,grand,month,fin_year){
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt=this.mainService.accInfo['account_name']+"("+this.mainService.accInfo['account_short_name']+")"+"   "+header['bill_desc']+"   Date: "+header['accrual_date'];
    var dd ={
      pageSize: 'A3',
      header:function(currentPage, pageCount) { 
        var obj = {text: txt+"     Page No. - "+currentPage,alignment: 'center',margin: [72,40]};
        return obj; 
      },
      
      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',
    
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 40, 60, 40, 60 ],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [
        
      ]
    };
    var sections = Object.keys(billObj);
    var count=0;
    for(var i=0;i<sections.length;i++){
      var data = billObj[sections[i]];

      var sectionText={ text: 'Section : '+sections[i], fontSize: 8};
      if(i!=0){
        sectionText['pageBreak'] = 'before'
      }
      dd.content.push(sectionText);
      var tbl ={
     
        layout: 'lightHorizontalLines',
        fontSize: 10, 
        table: {
     
          headerRows: 1,
          widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
          
          body: [
            [ 'Emp\nDetail', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief','Med\nAllow','Veh\nAllow','HRA','WA','Misc\nAllow','Total','LIC','PF\nDed','NPS','Group\nIns.','IT','House\nRent','Veh\nDed','Veh\nAdv.','Bld\nAdv.','PF\nAdv.','Bank\nAdv.','EWF','Misc\nDed','Net.\nSal.' ]
           
            
            
          ]
        }
      };
      dd.content.push(tbl);
      var emps= Object.keys(data['data']);
      count=count+emps.length;
      for(var j=0;j<emps.length;j++){
        var obj = data['data'][emps[j]];
        var arr=[];
        var str = obj['emp_id']+"\n"+obj['emp_name']+"\n"+obj['designation_code']+"\n"+obj['grade_pay_code']+"\n"+obj['pay_band']+"\n"+"SAL A/C - "+obj['sal_acc'];
        if(obj['pf']!=undefined && obj['pf']!=null && obj['pf']!=0){
          str+="\n"+"PF A/C - "+obj['pf']
        }
        if(obj['pf_ifsc']!=undefined && obj['pf_ifsc']!=null && obj['pf_ifsc']!=0){
          str+="\n"+"PF Ifsc - "+obj['pf_ifsc']
        }
        arr.push(str);
        if(obj['BASIC_arr'] != undefined){
          for (let i = 0; i < obj['BASIC_arr'].length; i++) {
            if(i == 0){
              var basic=obj['BASIC_arr'][i]
 
            }else{
               basic=basic+"\n"+obj['BASIC_arr'][i]

            }

            
          }
          arr.push(basic);
        }else{
          arr.push(obj['BASIC']);

        }
      if(obj['DEP_arr'] != undefined){
          for (let i = 0; i < obj['DEP_arr'].length; i++) {
            if(i == 0){
              var DEP=obj['DEP_arr'][i]
 
            }else{
              DEP=DEP+"\n"+obj['DEP_arr'][i]

            }

            
          }
          arr.push(DEP);
        }else{
          arr.push(obj['DEP']);

        }
        if(obj['DA_arr'] != undefined){
          for (let i = 0; i < obj['DA_arr'].length; i++) {
            if(i == 0){
              var DA=obj['DA_arr'][i]
 
            }else{
              DA=DA+"\n"+obj['DA_arr'][i]

            }

            
          }
          arr.push(DA);
        }else{
          arr.push(obj['DA']);

        }
        if(obj['MA_arr'] != undefined){
          for (let i = 0; i < obj['MA_arr'].length; i++) {
            if(i == 0){
              var MA=obj['MA_arr'][i]
 
            }else{
              MA=MA+"\n"+obj['MA_arr'][i]

            }

            
          }
          arr.push(MA);
        }else{
          arr.push(obj['MA']);

        } 
        if(obj['VA_arr'] != undefined){
          for (let i = 0; i < obj['VA_arr'].length; i++) {
            if(i == 0){
              var VA=obj['VA_arr'][i]
 
            }else{
              VA=VA+"\n"+obj['VA_arr'][i]

            }

            
          }
          arr.push(VA);
        }else{
          arr.push(obj['VA']);

        } if(obj['HRA_arr'] != undefined){
          for (let i = 0; i < obj['HRA_arr'].length; i++) {
            if(i == 0){
              var HRA=obj['HRA_arr'][i]
 
            }else{
              HRA=HRA+"\n"+obj['HRA_arr'][i]

            }

            
          }
          arr.push(HRA);
        }else{
          arr.push(obj['HRA']);

        }
        if(obj['WA_arr'] != undefined){
          for (let i = 0; i < obj['WA_arr'].length; i++) {
            if(i == 0){
              var WA=obj['WA_arr'][i]
 
            }else{
              WA=WA+"\n"+obj['WA_arr'][i]

            }

            
          }
          arr.push(WA);
        }else{
          arr.push(obj['WA']);

        }
       /*  arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']); */
        //arr.push(obj['VA']);
       // arr.push(obj['HRA']);
       // arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var str1="";
        for(var k=0;k<miscpay.length;k++){
          if(k==0){
            str1+=miscpay[k]['code'] +" - "+ miscpay[k]['amount'];
          }else{
            str1+="\n"+miscpay[k]['code'] +" - "+ miscpay[k]['amount'];
          }

        }
        if(str1!=""){
          arr.push(str1);
        }
        else{
          arr.push(0.00);
        }
        arr.push(obj['total']);
        var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];

        arr.push(licstr);
        if(obj['PF_arr'] != undefined){
          for (let i = 0; i < obj['PF_arr'].length; i++) {
            if(i == 0){
              var PF=obj['PF_arr'][i]
 
            }else{
               PF=PF+"\n"+obj['PF_arr'][i]

            }

            
          }
          arr.push(PF);
        }else{
          arr.push(obj['PF']);

        }
      if(obj['NPS_arr'] != undefined){
          for (let i = 0; i < obj['NPS_arr'].length; i++) {
            if(i == 0){
              var NPS=obj['NPS_arr'][i]
 
            }else{
              NPS=NPS+"\n"+obj['NPS_arr'][i]

            }

            
          }
          arr.push(NPS);
        }else{
          arr.push(obj['NPS']);

        }
        if(obj['GIS_arr'] != undefined){
          for (let i = 0; i < obj['GIS_arr'].length; i++) {
            if(i == 0){
              var GIS=obj['GIS_arr'][i]
 
            }else{
              GIS=GIS+"\n"+obj['GIS_arr'][i]

            }

            
          }
          arr.push(GIS);
        }else{
          arr.push(obj['GIS']);

        }
        if(obj['IT_arr'] != undefined){
          for (let i = 0; i < obj['IT_arr'].length; i++) {
            if(i == 0){
              var IT=obj['IT_arr'][i]
 
            }else{
              IT=IT+"\n"+obj['IT_arr'][i]

            }

            
          }
          arr.push(IT);
        }else{
          arr.push(obj['IT']);

        } 
        if(obj['HRR_arr'] != undefined){
          for (let i = 0; i < obj['HRR_arr'].length; i++) {
            if(i == 0){
              var HRR=obj['HRR_arr'][i]
 
            }else{
              HRR=HRR+"\n"+obj['HRR_arr'][i]

            }

            
          }
          arr.push(HRR);
        }else{
          arr.push(obj['HRR']);

        } if(obj['VD_arr'] != undefined){
          for (let i = 0; i < obj['VD_arr'].length; i++) {
            if(i == 0){
              var VD=obj['VD_arr'][i]
 
            }else{
              VD=VD+"\n"+obj['VD_arr'][i]

            }

            
          }
          arr.push(VD);
        }else{
          arr.push(obj['VD']);

        }
        if(obj['VADV_arr'] != undefined){
          for (let i = 0; i < obj['VADV_arr'].length; i++) {
            if(i == 0){
              var VADV=obj['VADV_arr'][i]
 
            }else{
              VADV=VADV+"\n"+obj['VADV_arr'][i]

            }

            
          }
          arr.push(VADV);
        }else{
          arr.push(obj['VADV']);

        }
       /*  arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']); */
        var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(bldstr);
        var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(pfstr);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var str2="";
        for(var k=0;k<miscded.length;k++){
          if(k==0){
            str2+=miscded[k]['code'] +" - "+ miscded[k]['amount'];
          }else{
            str2+="\n"+miscded[k]['code'] +" - "+ miscded[k]['amount'];
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push(obj['net']);
        
        dd.content[dd.content.length-1].table.body.push(arr);
      }
      var obj = data['total'];
        var arr=[];
        var str = "Section : "+sections[i]+"\n";
        str+="Total Employees : "+emps.length;
        
        arr.push(str);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var miscpayObj={};
        for(var k=0;k<miscpay.length;k++){
          if(miscpayObj[miscpay[k]['code']]==undefined){
            miscpayObj[miscpay[k]['code']] =0;
          }
          miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscpayObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscpayObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }
        arr.push(obj['total']);
        var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];

        arr.push(licstr);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(bldstr);
        var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(pfstr);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var miscdedObj={};
        for(var k=0;k<miscded.length;k++){
          if(miscdedObj[miscded[k]['code']]==undefined){
            miscdedObj[miscded[k]['code']] =0;
          }
          miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscdedObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscdedObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push(obj['net']);
        
        dd.content[dd.content.length-1].table.body.push(arr);

    }
    var totalText={ text: 'Grand Total'+"\nTotal Employees : "+count, fontSize: 10,bold:true};

    var obj = grand;
     var arr=[]
     arr.push(totalText);
     arr.push(obj['BASIC']);
     arr.push(obj['DEP']);
     arr.push(obj['DA']);
     arr.push(obj['MA']);
     arr.push(obj['VA']);
     arr.push(obj['HRA']);
     arr.push(obj['WA']);
     var miscpay = obj['miscpay'];
     var miscpayObj={};
     for(var k=0;k<miscpay.length;k++){
       if(miscpayObj[miscpay[k]['code']]==undefined){
         miscpayObj[miscpay[k]['code']] =0;
       }
       miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
     }
     var str2="";
     var keys=Object.keys(miscpayObj);
     for(var k=0;k<keys.length;k++){
       if(k==0){
         str2+=keys[k] +" - "+ miscpayObj[keys[k]];
       }else{
         str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
       }

     }
     if(str2!=""){
       arr.push({text:str2,fontSize:8});
     }
     else{
       arr.push(0.00);
     }
     arr.push({text:obj['total'],bold:true});
     var amt = obj['LIC1']+obj['LIC2']+obj['LIC3']+obj['LIC4']+obj['LIC5']+obj['LIC6']+obj['LIC7']
     //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
     //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
     arr.push(amt);
     arr.push(obj['PF']);
     arr.push(obj['NPS']);

     arr.push(obj['GIS']);
     arr.push(obj['IT']);
     arr.push(obj['HRR']);
     arr.push(obj['VD']);
     arr.push(obj['VADV']);
     amt = obj['BLDADV1']+obj['BLDADV2']+obj['BLDADV3'];
     //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
     arr.push(amt);
     amt = obj['PFADV']+obj['PFADV1']+obj['PFADV2'];
     //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
     arr.push(amt);
     arr.push(obj['BADV']);
     arr.push(obj['EWF']);
     var miscded = obj['miscded'];
     var miscdedObj={};
     for(var k=0;k<miscded.length;k++){
       if(miscdedObj[miscded[k]['code']]==undefined){
         miscdedObj[miscded[k]['code']] =0;
       }
       miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
     }
     var str2="";
     var keys=Object.keys(miscdedObj);
     for(var k=0;k<keys.length;k++){
       if(k==0){
         str2+=keys[k] +" - "+ miscdedObj[keys[k]];
       }else{
         str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
       }

     }
     if(str2!=""){
       arr.push({text:str2,fontSize:8});
     }
     else{
       arr.push(0.00);
     }

     arr.push({text: obj['net'],bold:true});
     
     dd.content[dd.content.length-1].table.body.push(arr);
     dd.content.push("\n\n");
     var sign1={
      columns: [
        {
          width: '*',
          text: 'PREPARED BY:',
          bold: true
        },

        {
          width: '*',
          text: 'CHECKED BY:' ,
          bold: true
        },
        {
          width: '*',
          text: 'SIGNED BY:',
          bold: true
        }

        
      ],

    }
     dd.content.push("\n\n\n");
     dd.content.push(sign1);
     dd.content.push("\n\n");
     dd.content.push({text:"CERTIFIED:",bold: true})
     dd.content.push("\n\n");
     dd.content.push({text:"1. That I have satisfied myself that all the salaries included in the bills drawn in the month of "+this.monthObj[month]+"/"+fin_year+" [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned."})
     dd.content.push("\n");
     dd.content.push({text:"2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month."})
     dd.content.push("\n");

     dd.content.push({text:"3. That all the persons for whom house-rent allowance has been shown in this bill actually occupied a rented house for which they paid rent as shown in this bill and are entitled to the allowance under the standing instructions."})
     dd.content.push("\n");

     dd.content.push({text:"4. That all the persons in respect of whom conveyance allowance has been drawn in the bill have satisfied me that they have actually maintained the conveyance in a workable condition and have been using them."})
     dd.content.push("\n");

     dd.content.push({text:"5. That the bill has been checked with the sanctioned in the scale register."})
     dd.content.push("\n");

     dd.content.push({text:"Date :                                                    Signature Of Drawing Officer:"})
     dd.content.push("\n");

     dd.content.push({text:"Pay Rs. ....................................."})


 
  
    pdfMake.createPdf(dd).download();
  }

  print1(billObj,header,grand,month,fin_year){
    if(month == 1 || month == 2 || month ==3){
      fin_year=fin_year+1;
    }
    
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt=this.mainService.accInfo['account_name']+"("+this.mainService.accInfo['account_short_name']+")"+"   "+header['bill_desc']+"   Date: "+header['accrual_date'];
    var dd ={
      pageSize: 'A3',
      header:function(currentPage, pageCount) { 
        var obj = {text: txt+"     Page No. - "+currentPage,alignment: 'center',margin: [72,40]};
        return obj; 
      },
      
      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',
    
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 40, 60, 40, 60 ],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [
        
      ]
    };
    var sections = Object.keys(billObj);
    var count =0;
    var tbl ={
     
      layout: 'lightHorizontalLines',
      fontSize: 10, 
      table: {
   
        headerRows: 1,
        widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
        
        body: [
          [ 'Section\nDetail', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief','Med\nAllow','Veh\nAllow','HRA','WA','Misc\nAllow','Total','LIC','PF\nDed','NPS','Group\nIns.','IT','House\n Rent','Veh\nDed','Veh\nAdv.','Bld\nAdv.','PF\nAdv.','Bank\nAdv.','EWF','Misc\nDed','Net.\nSal.' ]

          //[ 'Section Detail', 'Basic\nPay', 'Dep. \nAllow', 'DA/Relief','Medical \nAllow','Vehicle\nAllow','HRA','Wash\nAllow','Misc\nAllow','Total','LIC\n(1,2,3,4,5,6,7)','PF\nDed','Group\nIns.','IT','House\n Rent','Vehicle\n Ded','Vehicle\n Adv.','Bld Adv.\n(1,2,3)','PF Adv.\n(1,2,3)','Bank\n Adv.','EWF','Misc\nDed','Net. Sal.' ]
         
          
          
        ]
      }
    };
    dd.content.push(tbl);
    for(var i=0;i<sections.length;i++){
      var data = billObj[sections[i]];
      var emps= Object.keys(data['data']);
      count+=emps.length;
        var obj = data['total'];
        var arr=[];
        var sectionText={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 10,bold:true};

       
        
        arr.push(sectionText);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var miscpayObj={};
        for(var k=0;k<miscpay.length;k++){
          if(miscpayObj[miscpay[k]['code']]==undefined){
            miscpayObj[miscpay[k]['code']] =0;
          }
          miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscpayObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscpayObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }
        arr.push({text:obj['total'],bold:true});
        var amt = obj['LIC1']+obj['LIC2']+obj['LIC3']+obj['LIC4']+obj['LIC5']+obj['LIC6']+obj['LIC7']
        //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
        //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
        arr.push(amt);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        amt = obj['BLDADV1']+obj['BLDADV2']+obj['BLDADV3'];
        //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(amt);
        amt = obj['PFADV']+obj['PFADV1']+obj['PFADV2'];
        //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(amt);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var miscdedObj={};
        for(var k=0;k<miscded.length;k++){
          if(miscdedObj[miscded[k]['code']]==undefined){
            miscdedObj[miscded[k]['code']] =0;
          }
          miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscdedObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscdedObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push({text: obj['net'],bold:true});
        
        dd.content[dd.content.length-1].table.body.push(arr);

    }
    var sectionText={ text: 'Grand Total'+"\nTotal Employees : "+count, fontSize: 10,bold:true};

       var obj = grand;
        var arr=[]
        arr.push(sectionText);
        arr.push(obj['BASIC']);
        arr.push(obj['DEP']);
        arr.push(obj['DA']);
        arr.push(obj['MA']);
        arr.push(obj['VA']);
        arr.push(obj['HRA']);
        arr.push(obj['WA']);
        var miscpay = obj['miscpay'];
        var miscpayObj={};
        for(var k=0;k<miscpay.length;k++){
          if(miscpayObj[miscpay[k]['code']]==undefined){
            miscpayObj[miscpay[k]['code']] =0;
          }
          miscpayObj[miscpay[k]['code']]+= miscpay[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscpayObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscpayObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscpayObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }
        arr.push({text:obj['total'],bold:true});
        var amt = obj['LIC1']+obj['LIC2']+obj['LIC3']+obj['LIC4']+obj['LIC5']+obj['LIC6']+obj['LIC7']
        //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
        //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
        arr.push(amt);
        arr.push(obj['PF']);
        arr.push(obj['NPS']);
        arr.push(obj['GIS']);
        arr.push(obj['IT']);
        arr.push(obj['HRR']);
        arr.push(obj['VD']);
        arr.push(obj['VADV']);
        amt = obj['BLDADV1']+obj['BLDADV2']+obj['BLDADV3'];
        //var bldstr=obj['BLDADV1']+"\n"+obj['BLDADV2']+"\n"+obj['BLDADV3']
        arr.push(amt);
        amt = obj['PFADV']+obj['PFADV1']+obj['PFADV2'];
        //var pfstr=obj['PFADV']+"\n"+obj['PFADV1']+"\n"+obj['PFADV2']
        arr.push(amt);
        arr.push(obj['BADV']);
        arr.push(obj['EWF']);
        var miscded = obj['miscded'];
        var miscdedObj={};
        for(var k=0;k<miscded.length;k++){
          if(miscdedObj[miscded[k]['code']]==undefined){
            miscdedObj[miscded[k]['code']] =0;
          }
          miscdedObj[miscded[k]['code']]+= miscded[k]['amount'];
        }
        var str2="";
        var keys=Object.keys(miscdedObj);
        for(var k=0;k<keys.length;k++){
          if(k==0){
            str2+=keys[k] +" - "+ miscdedObj[keys[k]];
          }else{
            str2+="\n"+keys[k] +" - "+ miscdedObj[keys[k]];;
          }

        }
        if(str2!=""){
          arr.push({text:str2,fontSize:8});
        }
        else{
          arr.push(0.00);
        }

        arr.push({text: obj['net'],bold:true});
        
        dd.content[dd.content.length-1].table.body.push(arr);
        dd.content.push("\n\n");
       
        var sign1={
          columns: [
            {
              width: '*',
              text: 'PREPARED BY:',
              bold: true
            },
    
            {
              width: '*',
              text: 'CHECKED BY:' ,
              bold: true
            },
            {
              width: '*',
              text: 'SIGNED BY:',
              bold: true
            }
    
            
          ],
    
        }
        dd.content.push("\n\n\n");
        dd.content.push(sign1);
        dd.content.push("\n\n");
        dd.content.push({text:"CERTIFIED:",bold:true})
        dd.content.push("\n\n");
        dd.content.push({text:"1. That I have satisfied myself that all the salaries included in the bills drawn in the month of "+this.monthObj[month]+"/"+fin_year+" [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned."})
        dd.content.push("\n");
        dd.content.push({text:"2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month."})
        dd.content.push("\n");

        dd.content.push({text:"3. That all the persons for whom house-rent allowance has been shown in this bill actually occupied a rented house for which they paid rent as shown in this bill and are entitled to the allowance under the standing instructions."})
        dd.content.push("\n");

        dd.content.push({text:"4. That all the persons in respect of whom conveyance allowance has been drawn in the bill have satisfied me that they have actually maintained the conveyance in a workable condition and have been using them."})
        dd.content.push("\n");

        dd.content.push({text:"5. That the bill has been checked with the sanctioned in the scale register."})
        dd.content.push("\n");

        dd.content.push({text:"Date :                                                    Signature Of Drawing Officer:"})
        dd.content.push("\n");

        dd.content.push({text:"Pay Rs. ....................................."})

  
    pdfMake.createPdf(dd).download();
  }

  applyFilter1(filterValue: string) {

    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }
  export() {
    $('#myModal').modal('show');
  }



  async generateXl() {
   
   
    var empObj = {};
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['month'] = this.billIdObj['month'];
    obj['fin_year'] = this.billIdObj['fin_year'];

    var resp = await this.payableService.getMonthlyBill(JSON.stringify(obj));
    if (resp['error'] == false) {
      var dt = resp.data;
      for (var i = 0; i < dt.length; i++) {
        if (empObj[dt[i].emp_id] == undefined) {
          empObj[dt[i].emp_id] = {}
          empObj[dt[i].emp_id]['emp_id'] =this.mainService.accInfo['account_short_name']+this.getNumberFormat(dt[i].emp_id);
          empObj[dt[i].emp_id]['net'] = 0;
        }
       
          if (dt[i].pay_code == 'PAY') {
            empObj[dt[i].emp_id]['net'] += dt[i].pay_component_amt;
          } else if (dt[i].pay_code == 'DED') {
            empObj[dt[i].emp_id]['net'] -= dt[i].pay_component_amt;
          }
        
      }
      var keys = Object.keys(empObj);
      var arr=[];
      for(var i=0;i<keys.length;i++){
        arr.push(empObj[keys[i]]);
      }
      this.excl.exportAsExcelFile(arr,'sal');

    } else {

    }
  }


  async summaryBill() {
    
    this.currentBillObj_temp = { header: {}, allSetionCode: [], data: {}, sums: {} };
  
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['month'] = this.billIdObj['month'];
    obj['fin_year'] = this.billIdObj['fin_year'];
    var resp = await this.payableService.getMonthlyBill(JSON.stringify(obj));
    if (resp['error'] == false) {
      var dt = resp.data;
      this.allBillData = dt;

      if (this.allBillData.length > 0) {
        this.currentBillObj_temp['header'] = this.allBillData[0];
      }
      if (this.currentBillObj_temp['header']['month'] == 1 || this.currentBillObj_temp['header']['month'] == 2 || this.currentBillObj_temp['header']['month'] == 3) {
        this.currentBillObj_temp['header']['year'] = this.currentBillObj_temp['header']['fin_year'] + 1
      } else {
        this.currentBillObj_temp['header']['year'] = this.currentBillObj_temp['header']['fin_year']

      }
      var ob = {};
      var total = 0;
      ob['ALL SECTION'] = {};
      ob['ALL SECTION']['payable'] = [];
      ob['ALL SECTION']['deduction'] = [];
      ob['ALL SECTION']['gross_pay'] = 0
      ob['ALL SECTION']['ded'] = 0
      ob['ALL SECTION']['net'] = 0;


      for (var i = 0; i < this.allBillData.length; i++) {
        if (ob[this.allBillData[i]['section_code']] == undefined) {
          this.currentBillObj_temp.allSetionCode.push(this.allBillData[i]['section_code']);
          ob[this.allBillData[i]['section_code']] = {};
          ob[this.allBillData[i]['section_code']]['payable'] = [];
          ob[this.allBillData[i]['section_code']]['deduction'] = [];
          ob[this.allBillData[i]['section_code']]['gross_pay'] = 0
          ob[this.allBillData[i]['section_code']]['ded'] = 0
          ob[this.allBillData[i]['section_code']]['net'] = 0;
          
        }
        if (this.allBillData[i].pay_code == 'PAY') {
          ob[this.allBillData[i]['section_code']]['gross_pay'] += this.allBillData[i].pay_component_amt
          ob[this.allBillData[i]['section_code']]['net'] += this.allBillData[i].pay_component_amt;
          ob[this.allBillData[i]['section_code']]['payable'].push(this.allBillData[i]);

          ob['ALL SECTION']['payable'].push(this.allBillData[i]);
          ob['ALL SECTION']['gross_pay'] += this.allBillData[i].pay_component_amt
          ob['ALL SECTION']['net'] += this.allBillData[i].pay_component_amt;

          total += this.allBillData[i].pay_component_amt;
          ob[this.allBillData[i]['section_code']]['gross_pay'] = parseFloat((ob[this.allBillData[i]['section_code']]['gross_pay']).toFixed(2))
          ob[this.allBillData[i]['section_code']]['net'] = parseFloat((ob[this.allBillData[i]['section_code']]['net']).toFixed(2))
        } else if (this.allBillData[i].pay_code == 'DED') {
          ob[this.allBillData[i]['section_code']]['ded'] += this.allBillData[i].pay_component_amt
          ob[this.allBillData[i]['section_code']]['net'] -= this.allBillData[i].pay_component_amt;
          ob[this.allBillData[i]['section_code']]['deduction'].push(this.allBillData[i]);


          ob['ALL SECTION']['ded'] += this.allBillData[i].pay_component_amt
          ob['ALL SECTION']['net'] -= this.allBillData[i].pay_component_amt;
          ob['ALL SECTION']['deduction'].push(this.allBillData[i]);

          total -= this.allBillData[i].pay_component_amt;
          ob[this.allBillData[i]['section_code']]['ded'] = parseFloat((ob[this.allBillData[i]['section_code']]['ded']).toFixed(2))
          ob[this.allBillData[i]['section_code']]['net'] = parseFloat((ob[this.allBillData[i]['section_code']]['net']).toFixed(2))
        } 


      }

      this.currentBillObj_temp['header']['total'] = parseFloat(total.toFixed(2));
      this.currentBillObj_temp.data = ob;
      this.currentBillObj_temp.allSetionCode.push('ALL SECTION')

      for (let i = 0; i < this.currentBillObj_temp['allSetionCode'].length; i++) {
        var pay_data = [];
        var temp_obj = {};
        for (let j = 0; j < this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'].length; j++) {
          if (pay_data.includes(this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'][j]['pay_component_code'])) {
            temp_obj[this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'][j]['pay_component_code']] += this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'][j]['pay_component_amt'];
          } else {
            pay_data.push(this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'][j]['pay_component_code'])
            temp_obj[this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'][j]['pay_component_code']] = this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'][j]['pay_component_amt'];
          }
        }
        this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'] = [];
        for (let k = 0; k < pay_data.length; k++) {
          var obj = new Object();
          obj['pay_component_code'] = pay_data[k];
          obj['pay_component_amt'] = temp_obj[pay_data[k]];

          this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['payable'].push(obj)
        }
      }




      for (let i = 0; i < this.currentBillObj_temp['allSetionCode'].length; i++) {
        var pay_data = [];
        var temp_obj = {};
        for (let j = 0; j < this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'].length; j++) {
          if (pay_data.includes(this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'][j]['pay_component_code'])) {
            temp_obj[this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'][j]['pay_component_code']] += this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'][j]['pay_component_amt'];
          } else {
            pay_data.push(this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'][j]['pay_component_code'])
            temp_obj[this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'][j]['pay_component_code']] = this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'][j]['pay_component_amt'];
          }
        }
        this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'] = [];
        for (let k = 0; k < pay_data.length; k++) {
          var obj = new Object();
          obj['pay_component_code'] = pay_data[k];
          obj['pay_component_amt'] = temp_obj[pay_data[k]];
          this.currentBillObj_temp.data[this.currentBillObj_temp['allSetionCode'][i]]['deduction'].push(obj)
        }
      }


      $('.nav-tabs a[href="#tab-3"]').tab('show');

    } else {

    }
  }
  salarySlipArroneclick = []
  async getoneclickPaySlip() {
  
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    //obj['emp_id'] = this.selectObj['emp_id'];
    obj['fin_year'] = this.selectObj['fin_year'];
    obj['month'] = this.selectObj['month'];
    this.salarySlipArroneclick =[]
    

    
    this.spinner.show();
    var resp = await this.payableService.getSalarySlip(JSON.stringify(obj));
    if (resp['error'] == false) {

      this.salarySlipArroneclick = resp.data;
      await this.buildoneclickslip()

     
      this.spinner.hide();
    } else {
      this.spinner.hide();
      Swal.fire("Error","Some Error Occurred",'error');
    }
  }
  payable
  deduction
  total
  selectedArr
  oneclickslip = []
  section
  sectionbill = []
  async buildoneclickslip() {
    this.spinner.show();
    this.oneclickslip = [];
    for (var i = 0; i < this.allEmplyees.length; i++) {
      
      this.payable = 0;
      this.deduction = 0;
      this.total = 0;
      this.section = ''
      var obj = new Object();
      obj = Object.assign({},this.allEmplyees[i])
      for (var j = 0; j < this.allCurrentArrangements.length; j++) {
        if (this.allCurrentArrangements[j].emp_id == obj['emp_id']) {
          this.selectedArr = this.allCurrentArrangements[j];
        }
      }
      for (var k = 0; k < this.salarySlipArroneclick.length; k++) {
        
        if (this.salarySlipArroneclick[k].emp_id == obj['emp_id']) {
          this.section = this.salarySlipArroneclick[k]['section_code']
          if (this.salarySlipArroneclick[k].pay_code == 'PAY') {
          
            this.payable += this.salarySlipArroneclick[k].pay_component_amt;
          } else if ((this.salarySlipArroneclick[k].pay_code == 'DED')) {
          
            this.deduction += this.salarySlipArroneclick[k].pay_component_amt;
          }
        }
      }
    
      this.total = parseFloat((this.payable - this.deduction).toFixed(2));
      
      obj['emp_id'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id'])
      if (this.total > 0) {
        var Obj = new Object();
        Obj['acct_no'] = obj['acct_no']
        Obj['ifsc_code'] = obj['ifsc_code']
        Obj['bank_code'] = obj['bank_code']
        Obj['emp_name'] = obj['emp_name']
        Obj['emp_id'] = obj['emp_id']
        Obj['designation_code'] = this.selectedArr['designation_code']
    
        Obj['payable'] = this.payable
        Obj['section_code'] = this.section
        Obj['deduction'] = this.deduction
       
        Obj['total'] = this.total
        this.oneclickslip.push(Obj)
      }
    }
    for (let i = 0; i < this.mainService.codeValueTechObj['HR0031'].length; i++) {  
      this.sectionbill[i] = []
      for (let j = 0; j < this.oneclickslip.length; j++) {
        if(this.mainService.codeValueTechObj['HR0031'][i]['code'] == this.oneclickslip[j]['section_code']){
          this.sectionbill[i].push(this.oneclickslip[j])
        }
        
      }
      
    }
   
    //this.print12()
    this.spinner.hide();
  }

  print12() {
    var t=0;

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " BANK PAY BILL LIST OF MONTH "+this.mainService.codeValueShowObj['HR0024'][this.selectObj['month']] + " - " + this.mainService.codeValueShowObj['HR0023'][this.selectObj['fin_year']];
    var dd = {
      pageSize: 'A4',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },


      pageOrientation: 'landscape',

      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };

    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*', '*', '*', '*'],

        body: [
          ['SNO', 'Employee ID',  'EMPOYEE NAME','ACCOUNT NO', 'IFSC CODE', 'DESIGNATION', 'NETSALARY']


        ]
      }
    };
    dd.content.push(tbl);
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }] });
    for (var i = 0; i < this.sectionbill.length; i++) {
      this.total = 0
      if( this.sectionbill[i].length > 0){
      for (let j = 0; j < this.sectionbill[i].length; j++) {
       
        if(j == 0){
          var tbl6 = {

            layout: 'lightHorizontalLines',
            fontSize: 10,
            table: {
      
              headerRows: 1,
              widths: ['*', '*','*', '*','*', '*','*'],
      
              body: [
                ['SECTION',this.sectionbill[i][j]['section_code'],'','','','','' ]
      
      
              ]
            }
          };
          dd.content.push(tbl6);
        }
     
      
     
      var arr = []
      arr.push(j + 1);
      arr.push( this.getNumberFormat(this.sectionbill[i][j]['emp_id']));
      arr.push(this.sectionbill[i][j]['emp_name']);
      arr.push(this.sectionbill[i][j]['acct_no']);
      arr.push(this.sectionbill[i][j]['ifsc_code']);
      arr.push(this.sectionbill[i][j]['designation_code']);
      arr.push(this.sectionbill[i][j]['total'].toFixed(2))
      this.total += this.sectionbill[i][j]['total']
      t=t+this.sectionbill[i][j]['total'];



      dd.content[dd.content.length - 1].table.body.push(arr);
      if(j == this.sectionbill[i].length-1){
        dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }] });
        var tbl7 = {

          layout: 'lightHorizontalLines',
          fontSize: 10,
          table: {
    
            headerRows: 1,
            widths: ['*', '*','*', '*','*', '*','*'],
    
            body: [
              ['Total AMOUNT','','','','','',this.total.toFixed(2) ]
    
    
            ]
          }
        };
        dd.content.push(tbl7);
      }
      }
    } 
    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({text: "GRAND TOTAL - "+t,bold:true,alignment: 'right'});

  




    pdfMake.createPdf(dd).download("Bill-list");
  }

  excelExport(){
    var arr = [];
    arr.push(["Employee ID","Employee Name","Designation","Section","Bank","IFSC Code","Account No","Payable","Deduction","Net Salary"])
    for(var i=0;i<this.oneclickslip.length;i++){
      var obj = this.oneclickslip[i]
      var arr1=[]
      arr1.push(obj['emp_id']);
      arr1.push(obj['emp_name']);

      arr1.push(obj['designation_code']);

      arr1.push(obj['section_code']);

      arr1.push(obj['bank_code']);

      arr1.push(obj['ifsc_code']);

      arr1.push(obj['acct_no']);

      arr1.push(obj['payable']);

      arr1.push(obj['deduction']);

      arr1.push(obj['total']);
      arr.push(arr1);

    }
    this.excl.exportAsExcelFile(arr,'sal');
  }
}
