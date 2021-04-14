import { Component, OnInit,ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import swal from 'sweetalert2';
import { ExcelService } from '../../service/file-export.service';
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import {MainService} from '../../service/main.service';
import { EstablishmentService } from '../../service/establishment.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NgxSpinnerService } from "ngx-spinner";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any

@Component({
  selector: 'app-payroll-report',
  templateUrl: './payroll-report.component.html',
  styleUrls: ['./payroll-report.component.css']
})
export class PayrollReportComponent implements OnInit {
  
  constructor(private spinner: NgxSpinnerService,private establishmentService : EstablishmentService,private excl: ExcelService,public mainService: MainService,private router: Router,private payableService: PayrollService) { }
  erpUser;
  b_acct_id;
  salaryObj={accrual_date:'',b_acct_id:'',fin_year:'',month:''}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  result =[]
  fixedpay = []
  displayedColumns = ['serial_no','emp_id','emp_name','designation_code','pay_component_amt','start_dt','end_dt'];
  datasource;
  allEmplyees=[]
  allVariablePay =[];
obj = {}
reqObj={}
empObj={};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    
    await this.getAllEmployees();
    
  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  async getAllEmployees() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_status_code'] = ["ACTIVE", "INACTIVE"];

    var resp = await this.establishmentService.getArrayAllCurrentEstablishementInfo(obj);   
    if (resp['error'] == false) {
      this.spinner.hide()
      var dt1 = resp.data;
      var dt=[]
      dt.push({emp_id:"-1",emp_name:"All Employee",emp_desc:"All Employee"})

      for(var i=0;i<dt1.length;i++){
        this.empObj[dt1[i]['emp_id']] = dt1[i];
        dt[i+1] = dt1[i];
        this.empObj
        dt[i+1]['emp_desc'] = this.mainService.accInfo['account_short_name']+this.getNumberFormat(dt1[i]['emp_id'])+" - "+dt1[i]['emp_name'];
      }
      this.allEmplyees = dt;


      
    } else {
      this.spinner.hide()
      swal.fire("Error","Error while getting All employee Info","error");
    }
  }

  async getFixPay(){
    this.spinner.show()
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    if(this.reqObj['emp_id'] !=-1){
      obj['emp_id'] = this.reqObj['emp_id'];
    }
    if(this.reqObj['pay_component_code'] !=undefined){
      obj['pay_component_code'] = this.reqObj['pay_component_code'];
    }
    var resp = await this.payableService.getAllFixedPay(obj);
    if(resp['error'] == false){
      var dt = resp['data'];
      var x=[];
      for(var i=0;i<dt.length;i++){
        if(dt[i]['pay_component_code'] == this.reqObj['pay_component_code']){
          x.push(dt[i])
        }
      }
      for(var i=0;i<x.length;i++){
        for(var j=0;j<this.allEmplyees.length;j++){
          if(x[i]['emp_id'] == this.allEmplyees[j]['emp_id']){
            x[i]['emp_id_desc'] = this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.allEmplyees[j]['emp_id']);
            x[i]['emp_name'] = this.allEmplyees[j]['emp_name'];
            x[i]['designation_code'] =this.allEmplyees[j]['designation_code'];
          }
        }
      }
      
      for (let i = 0; i < x.length; i++) {
        if(x[i]['effective_start_dt'] != undefined){
        x[i]['effective_start_dt'] = this.mainService.dateformatchange(x[i]['effective_start_dt'])
        x[i]['effective_end_dt'] = this.mainService.dateformatchange(x[i]['effective_end_dt'])
        }
      }
      this.fixedpay=x;
      this.datasource = new MatTableDataSource(x)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
      this.spinner.hide()
    }else{

      this.spinner.hide();
      swal.fire("Error","Error while getting data");
    }

  }

 

  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  

  export() {
    var exp = []
    for (var i = 0; i < this.fixedpay.length; i++) {
      var obj = new Object();
      obj['SNO'] = i + 1;
      obj['EMPLOYEE ID'] = this.fixedpay[i]['emp_id_desc'];
      obj['EMPLOYEE NAME'] = this.fixedpay[i]['emp_name'];
      obj['DESIGNATION'] = this.fixedpay[i]['designation_code'];
      obj['AMOUNT'] = this.fixedpay[i]['pay_component_amt'];
      obj['START DATE'] = this.fixedpay[i]['effective_start_dt'];
      if(this.fixedpay[i]['effective_end_dt']=="2090-10-10"){
        obj['END DATE'] = "Till Service Period";

      }else{
        obj['END DATE'] = this.fixedpay[i]['effective_end_dt'];

      }
      // obj['END DATE'] = this.fixedpay[i]['effective_end_dt'];
     

      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, this.reqObj['pay_component_code'])
  }
  print() {

    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " "+this.reqObj['pay_component_code']+" List";
    var dd = {
      pageSize: 'A4',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },


      pageOrientation: 'portrait',

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
          ['SNO', 'Employee ID', 'Employee Name', 'Designation', 'Amount','Start Date','End Date']


        ]
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < this.fixedpay.length; i++) {
      var arr = []
      arr.push(i + 1);
      arr.push(this.fixedpay[i]['emp_id_desc'])
      arr.push(this.fixedpay[i]['emp_name']);
      arr.push(this.fixedpay[i]['designation_code']);
      arr.push(this.fixedpay[i]['pay_component_amt']);
      arr.push(this.fixedpay[i]['effective_start_dt']);
      if(this.fixedpay[i]['effective_end_dt']=="2090-10-10"){
        arr.push("Till Service Period")

      }else{
        arr.push(this.fixedpay[i]['effective_end_dt'])

      }




      dd.content[dd.content.length - 1].table.body.push(arr);

    }
    
    




    pdfMake.createPdf(dd).download(this.reqObj['pay_component_code']);
  }
}
