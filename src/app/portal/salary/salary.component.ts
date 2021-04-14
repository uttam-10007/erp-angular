import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
// import { PayrollService } from '';
import { MainService } from '../service/main.service';
import { SalaryService } from '../service/salary.service';
import Swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.pdfMake.vfs;
// import {EstablishmentService} from '../../service/establishment.service';
// import {AllEmpService} from '../../service/all-emp.service'

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

  constructor(private salaryService: SalaryService, public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  salarySlipArr = [];
  selectObj = {};
  allArr = [];
  payableArr = [];
  dedArr = [];
  payable = 0;
  deduction = 0;
  total = 0;
  payableMonth = 0;
  deductionMonth = 0;
  totalMonth = 0;
  lines = [];
  selectedArr = {}
  bankObj = {};
  personalInfoObj = {};
  personalInfoObj1 = {emp_phone_no:'0000000000'};
  matrix = []
  topObject = {}
  PAY = []
  DED = []
 
  is_olny_user=false;
  monthArr = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  monthObj = { 1: 'January', 2: 'Febuary', 3: 'March', 4: 'April', 5: 'May', 6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December' }
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getPersonalInfo();
    await this.getCurrentArrangement();
  }
  itreportdata = []
  itreportobj = {}
  totalobj ={'BASIC':0.00,'DA':0.00,'DEP':0.00,'HRA':0.00,'MA':0.00,'VA':0.00,'WA':0.00,'miscpay':0.00,'LIC1':0.00,LIC2:0.00,LIC3:0.00,LIC4:0.00,LIC5:0.00,LIC6:0.00,LIC7:0.00,PF:0.00,NPS:0.00,GIS:0.00,IT:0.00,HRR:0.00,VD:0.00,VADV:0.00,BLDADV1:0.00,BLDADV2:0.00,BLDADV3:0.00,PFADV:0.00,PFADV1:0.00,PFADV2:0.00,BADV:0.00,EWF:0.00,miscded:0.00,total:0.00,net:0.00};

  async itreport(){
    var obb = new Object()
    obb['b_acct_id'] = this.b_acct_id
    obb['emp_id'] = this.mainService.emp_id;
    obb['fin_year'] = this.selectObj['fin_year'];
    var resp = await this.salaryService.getItReport(JSON.stringify(obb))
    if (resp['error'] == false) {
      this.itreportdata = resp.data
      this.itreportobj = {}
     // await this.getPersonalInfo();
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
          text: this.mainService.accInfo['account_short_name']+ this.getNumberFormat(this.mainService.emp_id) +' - '+this.personalInfoObj1['emp_name'] ,
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
            text:this.mainService.codeValueShowObj['HR0011'][this.personalInfoObj['designation_code']],
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
      console.log(this.selectObj['fin_year'])
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

  back(){
    this.router.navigate(['/index'])
  }
  async getPaySlip() {
    if(this.is_olny_user){
      Swal.fire('Warning', 'You Are Not A Employee !!', 'warning');
      return;
    }
    this.payableArr = [];
    this.dedArr = [];
    this.payable = 0;
    this.deduction = 0;
    this.total = 0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.mainService.emp_id;
    obj['fin_year'] = this.selectObj['fin_year'];
    //await this.itreport()
    this.spinner.show();
    var resp = await this.salaryService.getSalarySlip(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      this.salarySlipArr = resp.data;
      await this.buildObject()
      await this.buildMatrix()
      this.spinner.hide();
    } else {
      this.spinner.hide();
    }
  }
  async getPersonalInfo() {
    this.personalInfoObj1 ={emp_phone_no:'0000000000'};
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.mainService.emp_id;
    console.log(this.mainService.emp_id);
    this.spinner.show();
    var resp = await this.salaryService.getPersonalInfo(obj);
    console.log(resp);
    if (resp['error'] == false) {
      if(resp.data.length>0){
        this.personalInfoObj1 = resp.data[0];
      }else{
        this.is_olny_user=true;
      }
    }
  }

  async getCurrentArrangement() {
    this.personalInfoObj = {};
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.mainService.emp_id;;
    this.spinner.show();
    var resp = await this.salaryService.getEstablishementInfo(JSON.stringify(obj));
    console.log(resp);
    if (resp['error'] == false) {
      if (resp['data'].length > 0)
        this.personalInfoObj = resp.data[resp.data.length - 1];
    }
  }


  async buildSlip(month){
    console.log(month)
    this.selectObj['month']=month
    this.payableMonth = 0;
    this.deductionMonth = 0;
    this.totalMonth = 0;
    this.payableArr=[]
    this.dedArr=[]
    for(var i=0;i<this.salarySlipArr.length;i++){
      if(this.salarySlipArr[i]['month']==month){
        if(this.salarySlipArr[i].pay_code == 'PAY'){
          this.payableArr.push(this.salarySlipArr[i]);
          this.payableMonth += this.salarySlipArr[i].pay_component_amt;
        }else if((this.salarySlipArr[i].pay_code == 'DED')){
          this.dedArr.push(this.salarySlipArr[i]);
          this.deductionMonth += this.salarySlipArr[i].pay_component_amt;
        }
      }
      
    }
    console.log(this.payableArr)
    if(this.payableArr.length>this.dedArr.length){
      this.lines = this.payableArr;
    }else{
      this.lines = this.dedArr;
    }
    console.log(this.lines);
    this.totalMonth = parseFloat((this.payableMonth -this.deductionMonth).toFixed(2));
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Print it!'
    }).then((result) => {
      if (result.value) {
        this.print()
      }
    })
   //await this.print()
  }

 
  async buildMatrix() {

    this.PAY = []
    this.DED = []
    for (var i = 0; i < this.salarySlipArr.length; i++) {
      if (this.salarySlipArr[i]['pay_code'] == 'PAY') {
        this.topObject[this.salarySlipArr[i]['month']]['PAY'][this.salarySlipArr[i]['pay_component_code']] = this.salarySlipArr[i]['pay_component_amt']
        this.topObject[this.salarySlipArr[i]['month']]['gross'] = this.topObject[this.salarySlipArr[i]['month']]['gross'] + this.salarySlipArr[i]['pay_component_amt']
        this.topObject[this.salarySlipArr[i]['month']]['net'] = this.topObject[this.salarySlipArr[i]['month']]['net'] + this.salarySlipArr[i]['pay_component_amt']
        if (!this.PAY.includes(this.salarySlipArr[i]['pay_component_code'])) {
          this.PAY.push(this.salarySlipArr[i]['pay_component_code'])

        }
      }

      if (this.salarySlipArr[i]['pay_code'] == 'DED') {
        this.topObject[this.salarySlipArr[i]['month']]['DED'][this.salarySlipArr[i]['pay_component_code']] = this.salarySlipArr[i]['pay_component_amt']
        this.topObject[this.salarySlipArr[i]['month']]['net'] = this.topObject[this.salarySlipArr[i]['month']]['net'] - this.salarySlipArr[i]['pay_component_amt']

        if (!this.DED.includes(this.salarySlipArr[i]['pay_component_code'])) {
          this.DED.push(this.salarySlipArr[i]['pay_component_code'])

        }
      }


    }
    for (var i = 0; i < this.salarySlipArr.length; i++) {
      if (this.salarySlipArr[i].pay_code == 'PAY') {
       
        this.payable += this.salarySlipArr[i].pay_component_amt;
      } else if ((this.salarySlipArr[i].pay_code == 'DED')) {
        this.deduction += this.salarySlipArr[i].pay_component_amt;
      }
    }
    this.total = parseFloat((this.payable - this.deduction).toFixed(2));

  }



  buildObject() {

    this.topObject = new Object
    for (let i = 1; i <= 12; i++) {
      var obj = new Object
      obj = { PAY: {}, DED: {}, net: 0, gross: 0 }
      this.topObject[i] = obj
    }
  }



  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }
  async print() {
    //console.log(this.estabInfo)
    var txt = this.mainService.accInfo['account_name'] + '(' + this.mainService.accInfo['account_short_name'] + ')'
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
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
          text: 'Salary Slip for '+this.mainService.codeValueShowObj['HR0024'][this.selectObj['month']]+' / '+this.mainService.codeValueShowObj['HR0023'][this.selectObj['fin_year']],
          bold: true,
          alignment: 'center'
        }

      ],
    }
   
    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Legal Name :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj['emp_name']
        },
        {
          width: '*',
          text: 'Employee ID :',
          bold: true
        },

        {
          width: '*',
          text: 'VDA'+''+this.getNumberFormat(this.personalInfoObj['emp_id'])
        }

      ],
    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Phone No. :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj1['emp_phone_no']
        },
        {
          width: '*',
          text: 'Pan  :',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj1['emp_pan_no']
        }

      ],
    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Designation :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.codeValueShowObj['HR0011'][this.personalInfoObj['designation_code']]
        },
        {
          width: '*',
          text: 'Cadre :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.codeValueShowObj['HR0013'][this.personalInfoObj['cadre_code']]
        }

      ],
    }
    var header4 = {
      columns: [
       
        {
          width: '*',
          text: 'Class :',
          bold: true
        },

        {
          width: '*',
          text: this.mainService.codeValueShowObj['HR0014'][this.personalInfoObj['class_code']]
        },
        {
          width: '*',
          text: 'Account No. :',
          bold: true
        },

        {
          width: '*',
          text:this.personalInfoObj1['acct_no']
        }

      ],
    }
    var header5 = {
      columns: [
       
        {
          width: '*',
          text: 'IFSC Code : ',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj1['ifsc_code']
        },
        {
          width: '*',
          text: 'Bank :',
          bold: true
        },

        {
          width: '*',
          text:this.personalInfoObj1['bank_code']
        }

      ],
    }

    var header56 = {
      columns: [
       
        {
          width: '*',
          text: 'PF Account Number : ',
          bold: true
        },

        {
          width: '*',
          text: this.personalInfoObj1['pf_acct_no']
        },
        {
          width: '*',
          text: '',
          bold: true
        },

        {
          width: '*',
          text:''
        }

      ],
    }

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header0);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push({ text: " " });
    dd.content.push(header2);
    dd.content.push({ text: " " });
    dd.content.push(header3);
    dd.content.push({ text: " " });
    dd.content.push(header4);
    dd.content.push({ text: " " });
    dd.content.push(header5);
    dd.content.push({ text: " " });
    dd.content.push(header56);
   /*  dd.content.push({ text: " " });
    dd.content.push(header6); */
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*','*', '*', '*', '*'],
        body: [
          [{text:'S NO.',bold:true}, {text:'PAYABLES',bold:true}, {text:'AMOUNT',alignment:'right',bold:true}, {text:'DEDUCTIONS',bold:true}, {text:'AMOUNT',alignment:'right',bold:true}]
        ],
      }
    };
    

    dd.content.push(tbl);
    for (var i = 0; i < this.lines.length; i++) {
      var arr = []
      arr.push(i + 1);
      if(i < this.payableArr.length){
      arr.push(this.mainService.codeValueShowObj['HR0021'][this.payableArr[i]['pay_component_code']]);
      arr.push({text:this.payableArr[i]['pay_component_amt'],alignment:'right'});
      }else{
        arr.push('');
        arr.push({text:'',alignment:'right'});
      }
      if(i < this.dedArr.length){
      arr.push({text:this.mainService.codeValueShowObj['HR0021'][this.dedArr[i]['pay_component_code']]});
      arr.push({text:this.dedArr[i]['pay_component_amt'],alignment:'right'});
      }else{
        arr.push('');
        arr.push({text:'',alignment:'right'});
      }
     // arr.push({text:this.estabInfo[i]['level_code'],alignment:'right'});
     
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
      var header6 = {
      columns: [
       
        {
          width: '*',
          text: 'Total Payable : Rs.',
          bold: true
        },

        {
          width: '*',
          text:this.payableMonth
        },
        {
          width: '*',
          text: "Total Deductions : Rs.",
          bold: true
        },
        {
          width: '*',
          text: this.deductionMonth,
          bold: true
        },

      ],
    } 
    var header7 = {
      columns: [
       
        {
          width: '*',
          text: '',
          bold: true
        },

        {
          width: '*',
          text:''
        },
        {
          width: '*',
          text: "Net Payable : Rs.",
          bold: true
        },
        {
          width: '*',
          text: this.totalMonth,
          bold: true
        },

      ],
    }
      var header8 = {
      columns: [
       
        {
          width: '*',
          text: 'Employer Signature :',
          bold: true
        },

        {
          width: '*',
          text:'Date :'
        },
        {
          width: '*',
          text: "Employee Signature :",
          bold: true
        },
        {
          width: '*',
          text: 'Date :',
          bold: true
        },

      ],
    } 
    dd.content.push({ text: " " });
    dd.content.push(header6);
    dd.content.push({ text: " " });
    dd.content.push(header7);
    dd.content.push({ text: " " });
    dd.content.push(header8);
    // this.spinner.hide()
    pdfMake.createPdf(dd).download("salarySlip");
  }
//  async print() {


//     let printContents, popupWin;
//     printContents = document.getElementById('p').innerHTML;
//     popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
//     popupWin.document.open();
//     popupWin.document.write(`
//       <html>
//         <head>
//         <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
//         </head>
//         <style>
//         #tb2 {
//           font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
//           border-collapse: collapse;
//           width: 100%;
//           max-width: 2480px;
//       }
      
//       #tb2 td,
//       #tb2 th {
//           border: 1px solid #ddd;
//           padding: 8px;
//           width: auto;
//           overflow: hidden;
//           word-wrap: break-word;
//       }
      
//       #tb2 tr:nth-child(even) {
//           background-color: #f2f2f2;
//       }
      
//       #tb2 tr:hover {
//           background-color: #ddd;
//       }
//       .r {
//         margin-left: 5px;
//         margin-right: 5px;
//         background-color: #f2f2f2;
//     }
    
//     .r1 {
//         margin-left: 5px;
//         margin-right: 5px;
//         background-color: #ddd;
//     }
//     .r3 {
//       text-align: right
//   }
    
//     #h5 {
//         font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
//     }
//       #tb2 th {
//           padding-top: 12px;
//           padding-bottom: 12px;
//           text-align: left;
//           background-color: #4CAF50;
//           color: white;
//       }
//         </style>
//     <body onload="window.print();window.close()">${printContents}</body>
//       </html>`
//     );
//     popupWin.document.close();


//   }

}
