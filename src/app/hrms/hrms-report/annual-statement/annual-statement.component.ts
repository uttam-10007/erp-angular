import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
 import { PayrollService } from '../../service/payroll.service';
 import { MainService } from '../../service/main.service';
/*
import { SalaryService } from '../service/salary.service'; */
import Swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-annual-statement',
  templateUrl: './annual-statement.component.html',
  styleUrls: ['./annual-statement.component.css']
})
export class AnnualStatementComponent implements OnInit {
  b_acct_id;
  erpUser;
  constructor(private payroll:PayrollService,private mainService:MainService) { }
  monthArr = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  monthObj = { 1: 'January', 2: 'Febuary', 3: 'March', 4: 'April', 5: 'May', 6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December' }
  selectObj = {};
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllCurrentArrangements();
  }
  personalInfoObj = {};
  personalInfoObj1 = {emp_phone_no:'0000000000'};
  itreportdata = []
  itreportobj = {}
  totalobj ={'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':0.00,'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:0.00,total:0.00,net:0.00};
  async getPersonalInfo() {
    this.personalInfoObj1 ={emp_phone_no:'0000000000'};
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
   // console.log(this.mainService.emp_id);
    //this.spinner.show();
    var resp = await this.payroll.getPersonalInfo(obj);
    console.log(resp);
    if (resp['error'] == false) {
      if(resp.data.length>0){
        this.personalInfoObj1 = resp.data[0];
      }
      this.personalInfoObj1['emp_name'] = this.mainService.accInfo['account_short_name']+this.getNumberFormat(this.personalInfoObj1['emp_id'])+" - "+ this.personalInfoObj1['emp_name'];
      console.log(this.personalInfoObj1)
    }
  }
  empidtodesignation = {}
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  allArr = [];
  allEmplyees_new = []
  async getAllCurrentArrangements() {
    //this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var resp = await this.payroll.getAllCurrentArrangements(JSON.stringify(obj));
    if (resp['error'] == false) {
    //  this.spinner.hide()
      this.allArr = resp['data'];
      this.allEmplyees_new = [];
      for (let i = 0; i < this.allArr.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, this.allArr[i]);
        obj['tempemp_name'] =this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+" - "+ obj['emp_name'];
        this.allEmplyees_new.push(obj)
        this.empidtodesignation[obj['emp_id']] = obj['designation_code'];
      } console.log(this.empidtodesignation)

    }else{
     // this.spinner.hide()

    }
  }
  async itreport(){
    var obb = new Object()
    obb['b_acct_id'] = this.b_acct_id
    obb['emp_id'] = this.selectObj['emp_id'];//this.mainService.emp_id;
    obb['fin_year'] = this.selectObj['fin_year'];
    var resp = await this.payroll.getItReport(JSON.stringify(obb))
    if (resp['error'] == false) {
      this.itreportdata = resp.data
      this.itreportobj = {}
      await this.getPersonalInfo();
      for (let i = 0; i < this.itreportdata.length; i++) {
        if(this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']] == undefined){
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]= {}
        }
        if( this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['total'] == undefined){
          
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['total']={'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':[],'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:[],total:0.00,net:0.00};
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['totalpay']= 0
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['net_pay'] = 0
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['fin_year'] = this.itreportdata[i]['fin_year']
          
        }
        if(this.itreportdata[i]['pay_code'] =='PAY'){
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['totalpay'] +=this.itreportdata[i]['pay_component_amt']
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['net_pay'] +=this.itreportdata[i]['pay_component_amt']
          this.totalobj[this.itreportdata[i]['pay_component_code']] +=this.itreportdata[i]['pay_component_amt']


        }else{
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['net_pay'] -=this.itreportdata[i]['pay_component_amt']
          this.totalobj[this.itreportdata[i]['pay_component_code']] +=this.itreportdata[i]['pay_component_amt']

        }
        if(this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['total'][this.itreportdata[i]['pay_component_code']] != undefined){
          this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['total'][this.itreportdata[i]['pay_component_code']] += this.itreportdata[i]['pay_component_amt']
        }else{
          if(this.itreportdata[i]['pay_code'] =='PAY'){
            this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['total']['miscpay'].push(this.itreportdata[i]['pay_component_amt'])
            this.totalobj['miscpay'] +=this.itreportdata[i]['pay_component_amt']

          }else{
            this.totalobj['miscded'] +=this.itreportdata[i]['pay_component_amt']

            this.itreportobj[this.itreportdata[i]['month']+'-'+this.itreportdata[i]['fin_year']]['total']['miscded'].push(this.itreportdata[i]['pay_component_amt'])

          }

        }
      }
    }
    console.log(this.itreportobj,this.itreportdata)
    this.print1()
  }
  print1(){
    //var txt = "VARANASASI DEVELOPMENT AUTHORITY(VDA)   Officers/THIRD/FOURTH Category EMPLOYEES STATEMENT FOR THE MONTH OF June,2020   PIRNT DATE: 2020-10-10"
    var txt=this.mainService.accInfo['account_name']+"("+this.mainService.accInfo['account_short_name']+")";
    var dd ={
      pageSize: 'A3',
      header:function(currentPage, pageCount) { 
        var obj = {text: txt+"     Page No. - "+currentPage,alignment: 'center',margin: [72,40], fontSize: 15, bold: true };
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
   // console.log(dd)
    // dd.content.push("\n\n");
    var head={
      columns: [
      
{},
        {
          width: '*',
          align:'right',
          text: 'Annual Statement of Employee '+this.mainService.codeValueShowObj['HR0023'][this.selectObj['fin_year']] ,
          bold: true
        }
       
,{}
        
      ],

    }
    dd.content.push(head);
     var sign1={
      columns: [
        {
          width: '*',
          text: 'Employee Name :',
          bold: true
        },

        {
          width: '*',
          align:'left',
          text: this.personalInfoObj1['emp_name'] ,
          bold: true
        },
        {
          width: '*',
          text: 'PAN NUMBER :',
          bold: true
        },
        { width: '*',
        align:'left',
          text:this.personalInfoObj1['emp_pan_no'],
          bold: true
        },{
          width: '*',
          text: 'Designation :',
          bold: true
        },{
          width: '*',
          align:'left',
            text:this.empidtodesignation[this.personalInfoObj1['emp_id']],
            bold: true
        }

        
      ],

    }
    dd.content.push(sign1);
    var count=0;
   
      var tbl ={
     
        layout: 'lightHorizontalLines',
        fontSize: 10, 
        table: {
     
          headerRows: 1,
          widths: [200,'auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
          
          body: [
            [ 'Month', 'Basic\nPay', 'Dep.\nAllow', 'DA/Relief','Med\nAllow','Veh\nAllow','HRA','WA','Misc\nAllow','Total','LIC','PF\nDed','NPS','Group\nIns.','IT','House\nRent','Veh\nDed','Veh\nAdv.','Bld\nAdv.','PF\nAdv.','Bank\nAdv.','EWF','Misc\nDed','Net.\nSal.' ]
           
            
            
          ]
        }
      };
      dd.content.push(tbl);
      var totalamtpay = 0
      var totalamtnet= 0
      var itarr =[3,4,5,6,7,8,9,10,11,12,1,2,3] //Object.keys(this.itreportobj)
     var fin = this.selectObj['fin_year']
    // itarr[i]+'-'+fin
     for (let i = 0; i < itarr.length; i++) {
      if(itarr[i] == 3 && i == 0){
        fin = this.selectObj['fin_year'] -1
       }else{
        fin = this.selectObj['fin_year']
       }
       if(this.itreportobj[itarr[i]+'-'+fin] == undefined ||  (itarr[i] == 3 && (Number(this.itreportobj[itarr[i]+'-'+fin]['fin_year'])+1) == this.selectObj['fin_year'] && i != 0)){
        continue;
       }
      
      var arr = []
      if(itarr[i] == 1 || itarr[i] == 2 ||  (itarr[i] == 3 && (Number(this.itreportobj[itarr[i]+'-'+fin]['fin_year'])+ 1) == this.selectObj['fin_year'])){
        arr.push(this.monthObj[itarr[i]] +'-'+(Number(this.itreportobj[itarr[i]+'-'+fin]['fin_year'])+ 1))
      }else{
        arr.push(this.monthObj[itarr[i]] +'-'+this.itreportobj[itarr[i]+'-'+fin]['fin_year'])
      }
     
      arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['BASIC'])
     
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['DEP']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['DA']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['MA']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['VA']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['HRA']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['WA']);
        var miscpay = this.itreportobj[itarr[i]+'-'+fin]['total']['miscpay'];
        var str  = '0'
        for (let j = 0; j < miscpay.length; j++) {
         if(j == 0){
          str = miscpay[j]
         }else{
          str = str +'/n'+miscpay[j]
         }
          
        }
      arr.push(str)
      arr.push(this.itreportobj[itarr[i]+'-'+fin]['totalpay'])
totalamtpay += this.itreportobj[itarr[i]+'-'+fin]['totalpay']
      var amt1 = this.itreportobj[itarr[i]+'-'+fin]['total']['LIC1']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['LIC2']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['LIC3']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['LIC4']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['LIC5']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['LIC6']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['LIC7']
        //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
        //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
        arr.push(amt1);
      arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['PF']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['NPS']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['GIS']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['IT']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['HRR']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['VD']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['VADV'])
        var amt
        amt = this.itreportobj[itarr[i]+'-'+fin]['total']['BLDADV1']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['BLDADV2']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['BLDADV3'];
        //var bldstr=this.itreportobj[itarr[i]+'-'+fin]['total']['BLDADV1']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['BLDADV2']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['BLDADV3']
        arr.push(amt);
        amt = this.itreportobj[itarr[i]+'-'+fin]['total']['PFADV']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['PFADV1']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['PFADV2'];
        //var pfstr=this.itreportobj[itarr[i]+'-'+fin]['total']['PFADV']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['PFADV1']+"\n"+this.itreportobj[itarr[i]+'-'+fin]['total']['PFADV2']
        arr.push(amt);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['BADV']);
        arr.push(this.itreportobj[itarr[i]+'-'+fin]['total']['EWF']);
      var miscded = this.itreportobj[itarr[i]+'-'+fin]['total']['miscded'];
      var str1  = '0'
      for (let j = 0; j < miscded.length; j++) {
       if(j == 0){
        str1 = miscded[j]
       }else{
        str1 = str1 +'/n'+miscded[j]
       }
        
      }
      arr.push(str1)
      arr.push(this.itreportobj[itarr[i]+'-'+fin]['net_pay'])
      //arr.push(itarr[i]+'-'+fin)
      totalamtnet += this.itreportobj[itarr[i]+'-'+fin]['net_pay']

      dd.content[dd.content.length-1].table.body.push(arr);
     }
     var arr = []
     arr.push('Final Total')
     arr.push(this.totalobj['BASIC'])
    
       arr.push(this.totalobj['DEP']);
       arr.push(this.totalobj['DA']);
       arr.push(this.totalobj['MA']);
       arr.push(this.totalobj['VA']);
       arr.push(this.totalobj['HRA']);
       arr.push(this.totalobj['WA']);
       var miscpay = this.totalobj['miscpay'];
      
     arr.push(miscpay)
     arr.push(totalamtpay)
     var amt1 = this.totalobj['LIC1']+"\n"+this.totalobj['LIC2']+"\n"+this.totalobj['LIC3']+"\n"+this.totalobj['LIC4']+"\n"+this.totalobj['LIC5']+"\n"+this.totalobj['LIC6']+"\n"+this.totalobj['LIC7']
       //var licstr=obj['LIC1']+"\n"+obj['LIC2']+"\n"+obj['LIC3']+"\n"+obj['LIC4']+"\n"+obj['LIC5']+"\n"+obj['LIC6']+"\n"+obj['LIC7'];
       //var licstr={ text: 'Section : '+sections[i]+"\nTotal Employees : "+emps.length, fontSize: 8};
       arr.push(amt1);
     arr.push(this.totalobj['PF']);
       arr.push(this.totalobj['NPS']);
       arr.push(this.totalobj['GIS']);
       arr.push(this.totalobj['IT']);
       arr.push(this.totalobj['HRR']);
       arr.push(this.totalobj['VD']);
       arr.push(this.totalobj['VADV'])
       var amt
       amt = this.totalobj['BLDADV1']+"\n"+this.totalobj['BLDADV2']+"\n"+this.totalobj['BLDADV3'];
       //var bldstr=this.totalobj['BLDADV1']+"\n"+this.totalobj['BLDADV2']+"\n"+this.totalobj['BLDADV3']
       arr.push(amt);
       amt = this.totalobj['PFADV']+"\n"+this.totalobj['PFADV1']+"\n"+this.totalobj['PFADV2'];
       //var pfstr=this.totalobj['PFADV']+"\n"+this.totalobj['PFADV1']+"\n"+this.totalobj['PFADV2']
       arr.push(amt);
       arr.push(this.totalobj['BADV']);
       arr.push(this.totalobj['EWF']);
     var miscded = this.totalobj['miscded'];
    
     arr.push(miscded)
     arr.push(totalamtnet)
     //arr.push(itarr[i])
     

     dd.content[dd.content.length-1].table.body.push(arr);
     console.log(dd) 
   /*  console.log(dd)
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

    } */
   /*   dd.content.push("\n\n\n");
     dd.content.push(sign1);
     dd.content.push("\n\n");
     dd.content.push({text:"CERTIFIED:",bold: true})
     dd.content.push("\n\n"); */
    /*  dd.content.push({text:"1. That I have satisfied myself that all the salaries included in the bills drawn in the month of "+this.monthObj[month]+"/"+fin_year+" [the last preceding month] with the exception of those detailed below of which total has been refunded by deduction from the bill has been distributed to the proper persons and their receipts have been taken in acquittance rolls field in my office with reciept-stamp dully cancelled for every payment in access of Rs. 20 and that all leaves and promotions etc have been in the service book of the official concerned."})
     dd.content.push("\n"); */
   /*   dd.content.push({text:"2. That all persons for whom pay has been drawn in this bill have actually been entertained during the month."})
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


  */
  
    pdfMake.createPdf(dd).download();
  }
}
