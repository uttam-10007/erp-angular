import { MetadataService } from '../../service/metadata.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PartyService } from '../../service/party.service';
import { RefundService } from '../../service/refund.service';
import { SchemeService } from '../../service/scheme.service';
import { SubSchemeService } from '../../service/sub-scheme.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ExcelService } from '../../service/file-export.service';
import {MainService} from '../../service/main.service'
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;

@Component({
  selector: 'app-application-refund',
  templateUrl: './application-refund.component.html',
  styleUrls: ['./application-refund.component.css']
})
export class ApplicationRefundComponent implements OnInit {

  
  displayedColumns = ['party_id','party_name', 'application_amount','party_phone_no','party_acct_no','party_bank_name', 'party_branch_name','party_ifsc_code','action'];
  displayedColumns1 = ['party_id','party_name','party_phone_no','party_acct_no','party_bank_name','party_branch_name','party_ifsc_code','application_amount','action'];

  obj={}
  partyArr;
  partyObj={}
  partyFatherObj={}
  partyMob={};
  erpUser;
  b_acct_id
  data;
  data1=[];

  dataSource;
  dataSource1
  schemeArr;
  schemeObject={}
  selectedSchemeCode;
  subschemeArr;
  subschemeObject={}
  subselectedSchemeCode;
  arr_id='';
  propTypeArr;
  flatTypeArr;
  distArr
  areaArr
  generayeScheme;
  generateSchemeCode;
  generateSubschemeCode;
  user_id
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private subSchemeService: SubSchemeService, private mainService:MainService,private excel:ExcelService,private schemeService: SchemeService,private refundService: RefundService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

  
  async  ngOnInit() {
      this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
      this.b_acct_id =this.erpUser.b_acct_id;
      this.user_id =this.erpUser.user_id;
      await this.getAllSchemes()
      
    }
    async gettoGenerateRefunds(){
      this.spinner.show();

      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
      obj['scheme_code']=this.generateSchemeCode
      obj['sub_scheme_code']=this.generateSubschemeCode
      var resp = await this.refundService.getRefundGenerate(obj);
      if (resp['error'] == false) {
        this.data1 = resp.data;
        
    
        this.dataSource1 = new MatTableDataSource(this.data1);
        this.dataSource1.sort = this.sort;
        
        this.dataSource1.paginator = this.paginator;
      this.spinner.hide();

      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting data", 'Error', {
          duration: 5000,
        });
      }
    }

    async generateRefunds(){
      if(this.data1.length>0){
        var obj=new Object;
        obj['b_acct_id']=this.b_acct_id
        obj['update_user_id']=this.user_id
        obj['party_id']=[]
        for(let i=0;i<this.data1.length;i++){
          obj['party_id'].push(this.data1[i]['party_id'])
        }
        this.spinner.show();
        var resp = await this.refundService.generateRefund(obj);
        if (resp['error'] == false) {
          await this.gettoGenerateRefunds()

          this.data1=[]
          
          this.spinner.hide();
          this.snackBar.open("Refunded Successfully", 'Success!', {
            duration: 5000,
          });
          //this.toastr.successToastr('Added Successfully')
        } else {
          this.spinner.hide();
          this.snackBar.open("Request Failed", 'Error', {
            duration: 5000,
          });
          //this.toastr.errorToastr(resp['data']);
        }
      
      }
      else {
        this.spinner.hide();
        this.snackBar.open("No Data Found.", 'Error', {
          duration: 5000,
        });
      }
  
    }

    async getAllSchemes(){
      this.spinner.show();

      var resp = await this.schemeService.getScheme(this.b_acct_id);
      if (resp['error'] == false) {
        this.schemeArr = resp.data;
        
        for(let i=0;i<this.schemeArr.length;i++){
this.schemeObject[this.schemeArr[i]['scheme_code']]=this.schemeArr[i]['scheme_name']
        }
      this.spinner.hide();
       
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Schemes", 'Error', {
          duration: 5000,
        });
      }
    }
    async getAllSubschemes(){
      var obj = new Object();
      obj['b_acct_id'] = this.b_acct_id;
      obj['scheme_code']=this.generateSchemeCode;
      this.spinner.show();

      var resp = await this.subSchemeService.getsubScheme(obj);
      if (resp['error'] == false) {
        this.subschemeArr = resp.data;
        
        for(let i=0;i<this.subschemeArr.length;i++){
this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']]=this.subschemeArr[i]['sub_scheme_name']
        }
      this.spinner.hide();
       
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Schemes", 'Error', {
          duration: 5000,
        });
      }
    }
    async getAllSubschemesselected(){
      var obj = new Object();
      obj['b_acct_id'] = this.b_acct_id;
      obj['scheme_code']=this.selectedSchemeCode;
      this.spinner.show();

      var resp = await this.subSchemeService.getsubScheme(obj);
      if (resp['error'] == false) {
        this.subschemeArr = resp.data;
        
        for(let i=0;i<this.subschemeArr.length;i++){
this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']]=this.subschemeArr[i]['sub_scheme_name']
        }
      this.spinner.hide();
       
      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting Schemes", 'Error', {
          duration: 5000,
        });
      }
    }

    async changeScheme(){
      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
      obj['scheme_code']=this.selectedSchemeCode
      obj['sub_scheme_code']=this.subselectedSchemeCode
      this.spinner.show();

      var resp = await this.refundService.getrefunds(obj);
      if (resp['error'] == false) {
        this.data = resp.data;
        
    
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.sort = this.sort;
        
        this.dataSource.paginator = this.paginator;
      this.spinner.hide();

      } else {
        //this.toastr.errorToastr('Some Error Occurred')
        this.spinner.hide();
        this.snackBar.open("Error occured while getting refunds", 'Error', {
          duration: 5000,
        });
      }
    }

  //  async paymentDone(element,i){
  //     var obj=new Object;
  //     obj['b_acct_id']=this.b_acct_id
  //     obj['update_user_id']=this.user_id
  //     obj['refund_id']=[]
  //     obj['refund_id'].push(element['refund_id'])
  //     this.spinner.show()
  //     var resp = await this.refundService.donePayment(obj);
  //     if (resp['error'] == false) {
  //      this.changeScheme()
  //       this.spinner.hide();
  //       this.snackBar.open("Approved Successfully", 'Error', {
  //         duration: 5000,
  //       });

  //     } else {
  //       //this.toastr.errorToastr('Some Error Occurred')
  //       this.spinner.hide();
  //       this.snackBar.open("Request Failed", 'Error', {
  //         duration: 5000,
  //       });
  //     }
  //   }






 
    // async edit(element, i) {

    //   this.obj=element;
    //   this.obj['scheme_name']=this.schemeObject[element['scheme_code']]
      
    // $('.nav-tabs a[href="#tab-3"]').tab('show')

    // }
    // async update(){
    //   var obj=Object.assign({},this.obj);
    //   obj['b_acct_id']=this.b_acct_id
    //   obj['update_user_id']=this.user_id
    //    this.spinner.show();
     
    //   var resp = await this.refundService.updaterefund(obj);
    //   if (resp['error'] == false) {
  
    //    await this.changeScheme()
    //    this.obj={}
    //     this.spinner.hide();
    //    $('.nav-tabs a[href="#tab-1"]').tab('show')
    //    this.snackBar.open("Update Successfully", 'Success!', {
    //     duration: 5000,
    //   });
    //     //this.toastr.successToastr('Updated Successfully')
    //   } else {
    //     this.spinner.hide();
    //     this.snackBar.open("Request Failed", 'Error', {
    //       duration: 5000,
    //     });
    //     //this.toastr.errorToastr(resp['data']);
    //   }
    // }
    refressadd(){
      this.obj=Object.assign({},{})
    }
  
    applyFilter(filterValue: string) {

      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    async done(element,i){
      var obj=new Object;
      obj['b_acct_id']=this.b_acct_id
      obj['update_user_id']=this.user_id
      obj['party_id']=[element.party_id]
      this.spinner.show();
      var resp = await this.refundService.generateRefund(obj);
      if (resp['error'] == false) {
       await this.gettoGenerateRefunds()

        this.spinner.hide();
        this.snackBar.open("Refund Successfully", 'Success!', {
          duration: 5000,
        });
        //this.toastr.successToastr('Added Successfully')
      } else {
        this.spinner.hide();
        this.snackBar.open("Request Failed", 'Error', {
          duration: 5000,
        });}
    }
    export1() {
      var exp = []
      for (var i = 0; i < this.data.length; i++) {
        var obj = new Object();
        obj['SNO'] = i + 1;
        obj['Applicant ID'] = this.data[i]['party_id']
        obj['Applicant Name'] = this.data[i]['party_name']
        obj['Phone Number'] = this.data[i]['party_phone_no']
        obj['Account Number'] = this.data[i]['party_acct_no']
        obj['Bank Name'] = this.data[i]['party_bank_name']
        obj['Branch Name'] = this.data[i]['party_branch_name']
        obj['IFSC Code'] = this.data[i]['party_ifsc_code']
        obj['Amount'] = this.data[i]['application_amount']
        exp.push(obj);
      }
      this.excel.exportAsExcelFile(exp, 'application-refund')
    }
    async print(data) {
      this.spinner.show()
        var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
        var dd = {
          pageSize: 'A4',
          header: function (currentPage, pageCount) {
            var obj = { text: txt + "" + '', alignment: 'center', margin: [72, 40] };
            return obj;
          },
  
          pageOrientation: 'portrait',
  
          pageMargins: [40, 60, 40, 60],
          content: [
          ]
        };
        var header0 = {
          columns: [
            {
              width: '*',
              text: 'APPLICATION REFUND',
              bold: true,
              alignment:'center'
            }       
  
          ],
        }
    
         var header1 = {
          columns: [
            {
              width: '*',
              text: 'Applicant ID :',
              bold: true
            },
  
            {
              width: '*',
              text: data['party_id']
            },
            {
              width: '*',
              text: 'Applicant Name:',
              bold: true
            },
  
            {
              width: '*',
              text: data['party_name']
            }
  
          ],
        }
        var header2 = {
          columns: [
            {
              width: '*',
              text: 'Phone Number :',
              bold: true
            },
            {
              width: '*',
              text: data['party_phone_no']
  
  
            },
            {
              width: '*',
              text: 'Account Number :',
              bold: true
            },
  
            {
              width: '*',
              text: data['party_acct_no']
            }
          ],
        }
        var header3 = {
          columns: [
  
            {
              width: '*',
              text: 'Bank Name  :',
              bold: true
            },
            {
              width: '*',
              text: data['party_bank_name']
            },
            {
              width: '*',
              text: 'Branch Name :',
              bold: true
            },
            {
              width: '*',
              text: data['party_branch_name']
            }
          ],
        }
        var header4 = {
          columns: [
  
            {
              width: '*',
              text: 'IFSC Code :',
              bold: true
            },
            {
              width: '*',
              text: data['party_ifsc_code']
            },
            {
              width: '*',
              text: 'Amount :',
              bold: true
            },
  
            {
              width: '*',
              text: data['application_amount']
            }
          ],
        }
      
        dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
        dd.content.push({ text: " " });
        dd.content.push(header0);
        dd.content.push({ text: " " });
        dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
        dd.content.push({ text: " " });
        dd.content.push(header1);
        dd.content.push({ text: " " });
        dd.content.push(header2);
        dd.content.push({ text: " " });
        dd.content.push(header3);
        dd.content.push({ text: " " });
        dd.content.push(header4);
        dd.content.push({ text: " " });
        dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
        this.spinner.hide()
        pdfMake.createPdf(dd).download("application-refund");
   
    }
    async print1() {
      this.spinner.show()
      let data2 = []
      for (let i = 0; i < this.data.length; i++) {
        let obj = {}
        if(this.data[i]['party_id']){
          obj['party_id'] = this.data[i]['party_id']
        }else{
          obj['party_id']=''
        }
        if(this.data[i]['party_name']){
          obj['party_name'] = this.data[i]['party_name']
        }else{
          obj['party_name']=''
        }
        if(this.data[i]['party_phone_no']){
          obj['party_phone_no'] = this.data[i]['party_phone_no']
        }else{
          obj['party_phone_no']=''
        }
        if(this.data[i]['application_amount']){
          obj['application_amount'] = this.data[i]['application_amount']
        }else{
          obj['application_amount']=''
        }
        if(this.data[i]['party_bank_name']){
          obj['party_bank_name'] = this.data[i]['party_bank_name']
        }else{
          obj['party_bank_name']=''
        }
        if(this.data[i]['party_branch_name']){
          obj['party_branch_name'] = this.data[i]['party_branch_name']
        }else{
          obj['party_branch_name']=''
        }
        if(this.data[i]['party_ifsc_code']){
          obj['party_ifsc_code'] = this.data[i]['party_ifsc_code']
        }else{
          obj['party_ifsc_code']=''
        }
        if(this.data[i]['party_acct_no']){
          obj['party_acct_no'] = this.data[i]['party_acct_no']
        }else{
          obj['party_acct_no']=''
        }
        data2.push(obj)
      }
        
      let sch = '';
      let sub_sch = ''
      for (let i = 0; i < this.schemeArr.length; i++) {
        if (this.selectedSchemeCode == this.schemeArr[i]['scheme_code']) {
          sch = this.schemeArr[i]['scheme_name']
          break;
        }
      }
      for (let i = 0; i < this.subschemeArr.length; i++) {
        if (this.subselectedSchemeCode == this.subschemeArr[i]['sub_scheme_code']) {
          sub_sch = this.subschemeArr[i]['sub_scheme_name']
          break;
        }
      }
      var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
      var dd = {
        pageSize: 'A3',
        header: function (currentPage, pageCount) {
          var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
          return obj;
        },
  
        pageOrientation: 'landscape',
  
        pageMargins: [40, 60, 40, 60],
        content: [
        ]
      };
      var header0 = {
        columns: [
          {
            width: '*',
            text: 'Refund',
            bold: true,
            alignment: 'center'
          }
  
        ],
      }
      var header9 = {
        columns: [
          {
            width: '*',
            text: '* Note : This is a computer generated document.',
            bold: true,
            alignment: 'left'
          }
  
        ],
      }
     
      var header1 = {
        columns: [
          {
            width: '*',
            text: 'Scheme :',
            bold: true
          },
  
          {
            width: '*',
            text: sch
          },
          {
            width: '*',
            text: 'Sub Scheme :',
            bold: true
          },
  
          {
            width: '*',
            text: sub_sch
          }
  
        ],
      }
  
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
      dd.content.push({ text: " " });
      dd.content.push(header0);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
      dd.content.push({ text: " " });
      dd.content.push(header1);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
      dd.content.push({ text: " " });
      var tbl = {
        // layout: 'lightHorizontalLines',
        fontSize: 10,
        table: {
  
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*', '*','*','*'],
          body: [
            ['Application ID','Applicant Name','Phone Number', 'Amount', 'Account Number','Bank Name','Bank Branch','IFSC Code']
          ],
        }
      };
      dd.content.push(tbl);
      for (var i = 0; i < data2.length; i++) {
        var arr = []
        arr.push(data2[i]['party_id']);
        arr.push(data2[i]['party_name']);
        arr.push(data2[i]['party_phone_no']);
        arr.push(data2[i]['application_amount']);
        arr.push(data2[i]['party_acct_no']);
        arr.push(data2[i]['party_bank_name']);
        arr.push(data2[i]['party_branch_name']);
        arr.push(data2[i]['party_ifsc_code']);
        dd.content[dd.content.length - 1].table.body.push(arr);
      }
      dd.content.push({ text: " " });
      dd.content.push(header9);
      this.spinner.hide()
      pdfMake.createPdf(dd).download("refund");
    }
}



