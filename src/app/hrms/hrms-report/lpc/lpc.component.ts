import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import {MainService} from '../../service/main.service';
import {EstablishmentService} from '../../service/establishment.service';
import {AllEmpService} from '../../service/all-emp.service'
import swal from 'sweetalert2';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any

@Component({
  selector: 'app-lpc',
  templateUrl: './lpc.component.html',
  styleUrls: ['./lpc.component.css']
})
export class LpcComponent implements OnInit {

  constructor(private allEmpService: AllEmpService,private establishmentService: EstablishmentService,public mainService: MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  b_acct_id;
  salarySlipArr=[];
  selectObj={};
  allArr=[];
  payableArr=[];
  dedArr=[];
  payable=0;
  deduction=0;
  total=0;
  lines=[];
  selectedArr={}
  bankObj={};
  personalInfoObj={};
  allEmplyees_new = []
  emp_id
  obj = {}
  otherded = 0
  pay = 0
month
 monthlysalary 
  monthArr = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
  monthObj = { 1: 'January', 2: 'Febuary', 3: 'March', 4: 'April', 5: 'May', 6: 'June', 7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December' }
 
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllCurrentArrangements();

  }
  getNumberFormat(num){
    return num.toString().padStart(3, "0")
  }
  async getAllCurrentArrangements(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    
    var resp = await this.payableService.getAllCurrentArrangements(JSON.stringify(obj));
    if(resp['error']==false){
      this.allArr = resp['data'];
      this.allEmplyees_new=[];
      for(let i=0;i<this.allArr.length;i++){
        var obj=new Object();
        obj= Object.assign({},this.allArr[i]);
        obj['emp_name']=obj['emp_name']+"-"+this.getNumberFormat(obj['emp_id'])
        this.allEmplyees_new.push(obj)
      }
    }
  }



  async getLpctransfer(){
    this.payableArr=[];
    this.dedArr=[];
    this.payable=0;
    this.obj = {}
    this.deduction=0;
    this.total=0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    this.emp_id = this.getNumberFormat(obj['emp_id'])
    this.spinner.show();
    var resp = await this.payableService.getMaxYearAndMonth(JSON.stringify(obj));
    if(resp['error']==false){
      for(var i=0;i<this.allArr.length;i++){
        if(this.allArr[i].emp_id == this.selectObj['emp_id']){
          this.selectedArr=this.allArr[i];
        }
      }
      if(this.selectedArr['employee_current_type_code']== 'TRANSFERRED'){
        this.getPaySlip(resp.data[0]['fin_year'],resp.data[0]['month'])
        this.spinner.hide();
       
      }
      else{
        swal.fire("Sorry", this.selectedArr['emp_name']+" is not TRANSFERRED!",'info');
        this.spinner.hide();
      }
      
    }
    
  }
  async getLpcretire(){
    this.payableArr=[];
    this.dedArr=[];
    this.obj = {}
    this.payable=0;
    this.deduction=0;
    this.total=0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    this.emp_id = this.getNumberFormat(obj['emp_id'])
    this.spinner.show();
    var resp = await this.payableService.getMaxYearAndMonth(JSON.stringify(obj));
    if(resp['error']==false){
      for(var i=0;i<this.allArr.length;i++){
        if(this.allArr[i].emp_id == this.selectObj['emp_id']){
          this.selectedArr=this.allArr[i];
          this.spinner.hide();
        }
      }
       if(this.selectedArr['employee_current_type_code']== 'RETIRED'){
        this.getPaySlip(resp.data[0]['fin_year'],resp.data[0]['month'])
        this.spinner.hide();
      
      }
      else{
        this.spinner.hide();
        swal.fire("Sorry", this.selectedArr['emp_name']+" is not RETIRED!",'info');
        this.spinner.hide();
      } 
      
    }
    
  }
  async getLpcdeath(){
    this.payableArr=[];
    this.dedArr=[];
    this.obj = {}
    this.payable=0;
    this.deduction=0;
    this.total=0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    this.emp_id = this.getNumberFormat(obj['emp_id'])
    this.spinner.show();
    var resp = await this.payableService.getMaxYearAndMonth(JSON.stringify(obj));
    if(resp['error']==false){
      for(var i=0;i<this.allArr.length;i++){
        if(this.allArr[i].emp_id == this.selectObj['emp_id']){
          this.selectedArr=this.allArr[i];
          this.spinner.hide();
        }
      }
      if(this.selectedArr['employee_current_type_code']== 'DEATH'){
        this.getPaySlip(resp.data[0]['fin_year'],resp.data[0]['month'])
        this.spinner.hide();
        
      }
      else{
        swal.fire("Sorry", this.selectedArr['emp_name']+" is not !",'error');
        this.spinner.hide();
      }
      
    }
    // this.print3()
  }
  async getPaySlip(fin_year,month){
    this.payableArr=[];
    this.dedArr=[];
    this.payable=0;
    this.deduction=0;
    this.total=0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    obj['fin_year'] = fin_year;
    obj['month'] = month; 
    this.spinner.show();
    var resp = await this.payableService.getSalarySlip(JSON.stringify(obj));
    if(resp['error'] == false){
      
      this.salarySlipArr = resp.data;
      this.buildSlip();
      this.getArr();
      this.getPersonalInfo();
      //this.getBankInfo();
      this.spinner.hide();
      if(this.selectedArr['employee_current_type_code']== 'RETIRED')
      {
        this.print1();
      }
      if(this.selectedArr['employee_current_type_code']== 'DEATH')
      {
        this.print3();
      }
      if(this.selectedArr['employee_current_type_code']== 'TRANSFERRED'){
        this.print2();
      }
      
    }else{
      this.spinner.hide();
    }
    console.log(resp);
    
  }
  async getPersonalInfo(){
    this.personalInfoObj={};
    var obj= new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    this.selectObj['reason_of_retirement_and_date'] = this.selectObj['reason_of_retirement'] +' '+ this.selectObj['retirement_date']
    this.spinner.show();
    var resp = await this.allEmpService.getPersonalInfo(obj);
    if (resp['error'] == false) {
      this.personalInfoObj = resp.data[0];
    }
    
  }

  async getArr(){
    for(var i=0;i<this.allArr.length;i++){
      if(this.allArr[i].emp_id == this.selectObj['emp_id']){
        this.selectedArr=this.allArr[i];
      }
    }
  }
  async buildSlip(){
    console.log(this.salarySlipArr);
    
    for(var i=0;i<this.salarySlipArr.length;i++){
      if(this.salarySlipArr[i].pay_code == 'PAY'){
        this.payableArr.push(this.salarySlipArr[i]);
        this.payable += this.salarySlipArr[i].pay_component_amt;
      }else if((this.salarySlipArr[i].pay_code == 'DED')){
        this.dedArr.push(this.salarySlipArr[i]);
        this.deduction += this.salarySlipArr[i].pay_component_amt;
      }
    }
    for(var i=0;i<this.salarySlipArr.length;i++){
      var ob = this.salarySlipArr[i];
      if(this.obj[ob['pay_component_code']] == undefined){
        //this.fixedpay.push(ob['pay_component_code'])
          this.obj[ob['pay_component_code']] = ob['pay_component_amt'];
      }else{
          this.obj[ob['pay_component_code']] += ob['pay_component_amt'];
      }
    }
    for(var i= 0; i<this.dedArr.length;i++){
      var ob = this.dedArr[i];
      if(ob['pay_component_code']=='PF' || ob['pay_component_code']=='IT' || ob['pay_component_code']=='HR'  ){

      }
      else{
        this.otherded += ob['pay_component_amt'];
      }
    }
    if(this.payableArr.length>this.dedArr.length){
      this.lines = this.payableArr;
    }else{
      this.lines = this.dedArr;
    }
    this.total = parseFloat((this.payable -this.deduction).toFixed(2));
    this.buildsalary()
  }
 
buildsalary(){
  var date  = this.selectObj['retirement_date']
var dArr = date.split('-');
this.month = dArr[1]
this.monthlysalary =this.total-this.obj['DA']

}
 




 
  print() { 
  

    let printContents, popupWin;
    printContents = document.getElementById('p').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        </head>
        <style>
        #tbl {
          font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
          max-width: 2480px;
      }
      
      #tbl td,
      #tbl th {
          border: 1px solid #ddd;
          padding: 8px;
          width: auto;
          overflow: hidden;
          word-wrap: break-word;
      }
      
      #tbl tr:nth-child(even) {
          background-color: #f2f2f2;
      }
      
      #tbl tr:hover {
          background-color: #ddd;
      }
      .r {
        margin-left: 5px;
        margin-right: 5px;
        background-color: #f2f2f2;
    }
    
    .r1 {
        margin-left: 5px;
        margin-right: 5px;
        background-color: #ddd;
    }
    .r3 {
      text-align: right
  }
    
    #h5 {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    }
      #tbl th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #4CAF50;
          color: white;
      }
        </style>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  
   
} 
/* print1() {

  
  var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + "LPC FOR RETIREMENT";
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
  var header1 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  var header2 = {
    columns: [
      {
        width: '*',
        text: '1. Name of Officer/ Employee: ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['emp_name']
      }
      

    ],
  }
  var header21 = {
    columns: [
      {
        width: '*',
        text: '2. Designation of Officer/ Employee :',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['designation_code']
      }
      

    ],
  }
  var header3 = {
    columns: [
      {
        width: '*',
        text: '3. Reason of Retirement and Date :',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['reason_of_retirement_and_date']
      }

    ],
  }
    var header31 = {
    columns: [
 
      {
        width: '*',
        text: '4. Posting Point :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['posting_point']
      }

    ],
  }
  var header4 = {
    columns: [
      {
        width: '*',
        text: '5. Details of salary Mr. '+this.selectedArr['emp_name'] +'('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
      },
      // {
      //   width: '*',
      //   text: '',
      //   bold: true
      // },

      // {
      //   width: '*',
      //   text:''
      // }




    ],
  }
  var header5 = {
    columns: [
      {
        width: '*',
        text: 'Details of Salary',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header6 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  console.log(this.payable);
  var header61 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
 
  // var header71 = {
  //   columns: [
 
  //     {
  //       width: '*',
  //       text: 'Special Allowance:-',
  //       bold: true
  //     },

  //     {
  //       width: '*',
  //       text:this.obj['SA']
  //     }

  //   ],
  // }
  // var header8 = {
  //   columns: [
  //     {
  //       width: '*',
  //       text: 'Day Allowance:-  ',
  //       bold: true,
  //     },

  //     {
  //       width: '*',
  //       text: this.obj['DAA']
  //     }

  //   ],
  // }
  // var header81 = {
  //   columns: [
 
  //     {
  //       width: '*',
  //       text: 'House Rent Allowance:-',
  //       bold: true
  //     },

  //     {
  //       width: '*',
  //       text:this.obj['HRA']
  //     }

  //   ],
  // }
  // var header9 = {
  //   columns: [
  //     {
  //       width: '*',
  //       text: 'City Compensatory Allowance:- ',
  //       bold: true,
     
  //     },

  //     {
  //       width: '*',
  //       text: this.obj['CCA']
  //     }

  //   ],
  // }
  // var header91 = {
  //   columns: [
 
  //     {
  //       width: '*',
  //       text: 'Vehicle Allowance:-',
  //       bold: true
  //     },

  //     {
  //       width: '*',
  //       text:this.obj['VA']
  //     }

  //   ],
  // }
  var header10 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header11 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15

      },

    ],
  }

  var header15 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header151 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header16 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }




  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header1);
  dd.content.push({ text: " " });
  dd.content.push(header2);
  dd.content.push({ text: " " });
  dd.content.push(header21);
  dd.content.push({ text: " " });
  dd.content.push(header3);
  dd.content.push({ text: " " });
  dd.content.push(header31);
  dd.content.push({ text: " " });
  dd.content.push(header4);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });

  dd.content.push(header5);
  dd.content.push({ text: " " });
  dd.content.push(header6);
  dd.content.push({ text: " " });
  dd.content.push(header61);
  dd.content.push({ text: " " });
  for(let i=0;i<this.payableArr.length;i++){
    var header7 = {
      columns: [
        {
          width: '*',
          text:this.payableArr[i]['pay_component_code'] ,
          bold: true,
        },
  
        {
          width: '*',
          text: this.payableArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header7);
    dd.content.push({ text: " " });
  }

  // dd.content.push(header71);
  // dd.content.push({ text: " " });
  // dd.content.push(header8);
  // dd.content.push({ text: " " });
  // dd.content.push(header81);
  // dd.content.push({ text: " " });
  // dd.content.push(header9);
  // dd.content.push({ text: " " });
  dd.content.push(header10);
  
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header11);
  dd.content.push({ text: " " });
  for(let i=0;i<this.dedArr.length;i++){
    var header12 = {
      columns: [
        {
          width: '*',
          text:this.dedArr[i]['pay_component_code'] ,
          bold: true,
        },
  
        {
          width: '*',
          text: this.dedArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header12);
    dd.content.push({ text: " " });
  }
  dd.content.push(header15);
  dd.content.push({ text: " " });
  dd.content.push(header151);
  dd.content.push({ text: " " });
  dd.content.push(header16);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });  
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });





 
  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });


  
  

// console.log(this.monthArr);

//   var tbl = {
//     layout: 'lightHorizontalLines',
//     fontSize: 10,
//     table: {

//       headerRows: 1,
//       widths: ['*','*', '*', '*', '*', '*','*'],
//       body: [
//         [' S No.', 'Month', ' Total Salary', {text:'DA Rate',alignment:'left'}, {text:'Dearness Allowance',alignment:'left'}, {text:'Total',alignment:'left'},{text:'Remark',alignment:'left'}]
//       ],
//     }
//   };
//   dd.content.push(tbl);
//   var deduction_amount = 0

//   var amount = 0
//   if(this.obj['DA']){
//     this.obj['DA']=this.obj['DA']
//   }else{
//     this.obj['DA']=''
//   }
//   for (var i = 0; i < this.monthArr.length; i++) {
//     var arr = []
// arr.push( i+1)
// arr.push(this.monthObj[this.monthArr[i]])
// arr.push('')
// arr.push('17%')
// arr.push(this.obj['DA'])
// arr.push(this.total)
// arr.push('')

//     dd.content[dd.content.length - 1].table.body.push(arr);

//   }
//   dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  
   var header01 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  var header02 = {
    columns: [
      {
        width: '*',
        text: '1. Name of Officer/ Employee: ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['emp_name']
      }
      

    ],
  }
  var header03 = {
    columns: [
      {
        width: '*',
        text: '2. Designation of Officer/ Employee :',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['designation_code']
      }
      

    ],
  }
  var header04 = {
    columns: [
      {
        width: '*',
        text: '3. Reason of Retirement and Date :',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['reason_of_retirement_and_date']
      }

    ],
  }
    var header05 = {
    columns: [
 
      {
        width: '*',
        text: '4. Posting Point :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['posting_point']
      }

    ],
  }
  var header06 = {
    columns: [
      {
        width: '*',
        text: '5. Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
      },
      // {
      //   width: '*',
      //   text: '',
      //   bold: true
      // },

      // {
      //   width: '*',
      //   text:''
      // }




    ],
  }
  var header07 = {
    columns: [
      {
        width: '*',
        text: 'Details of Salary',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header08 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  var header09 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.pay
      }

    ],
  } 
 
  var header016 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header017 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

  var header024 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header025 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header026 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }
  var header027 = {
    columns: [
      {
        width: '*',
        text: 'Details of PF Account',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
  var header028 = {
    columns: [

      {
        width: '*',
        text: '6. Date of Annual Increment:',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['emp_name']
      }

    ],
  }
  var header029 = {
    columns: [

      {
        width: '*',
        text: '7. Releving date :',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['designation_code']
      }

    ],
  }
  var header030 = {
    columns: [

      {
        width: '*',
        text: '8. Due leave :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['retirement_date']
      }

    ],
  }
  var header031 = {
    columns: [

      {
        width: '*',
        text: '9. Earned Leave :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['posting_point']
      }

    ],
  }
  var header032 = {
    columns: [

      {
        width: '*',
        text: '10. Casual Leave :',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }






  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
 
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header01);
  dd.content.push({ text: " " });
  dd.content.push(header02);
  dd.content.push({ text: " " });
  dd.content.push(header03);
  dd.content.push({ text: " " });
  dd.content.push(header04);
  dd.content.push({ text: " " });
  dd.content.push(header05);
  dd.content.push({ text: " " });
  dd.content.push(header06);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header07);
  dd.content.push({ text: " " });
  dd.content.push(header08);
  dd.content.push({ text: " " });
  dd.content.push(header09);
  dd.content.push({ text: " " });
  for(let i=0;i<this.payableArr.length;i++){
    var header010 = {
      columns: [
        {
          width: '*',
          text:this.payableArr[i]['pay_component_code'] ,
          bold: true,
        },
        {
          width: '*',
          text: this.payableArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header010);
    dd.content.push({ text: " " });
  }
  dd.content.push(header016);
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header017);
  dd.content.push({ text: " " });
  for(let i=0;i<this.dedArr.length;i++){
    var header018 = {
      columns: [
        {
          width: '*',
          text:this.dedArr[i]['pay_component_code'] ,
          bold: true,
        },
  
        {
          width: '*',
          text: this.dedArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header018);
    dd.content.push({ text: " " });
  }
  dd.content.push(header024);
  dd.content.push({ text: " " });
  dd.content.push(header025);
  dd.content.push({ text: " " });
  dd.content.push(header026);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header027);
  dd.content.push({ text: " " });
  dd.content.push(header028);
  dd.content.push({ text: " " });
  dd.content.push(header029);
  dd.content.push({ text: " " });
  dd.content.push(header030);
  dd.content.push({ text: " " });
  dd.content.push(header031);
  dd.content.push({ text: " " });
  dd.content.push(header032);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  



  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  // dd.content.push({ text: " " });

 

  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });


//   var tbl = {
//     layout: 'lightHorizontalLines',
//     fontSize: 10,
//     table: {

//       headerRows: 1,
//       widths: ['*','*', '*', '*', '*', '*','*'],
//       body: [
//         [' S No.', 'Month', ' Total Salary', {text:'GIS',alignment:'left'}, {text:'Providend Fund',alignment:'left'}, {text:'Income Tax',alignment:'left'},{text:'Other Details',alignment:'left'}]
//       ],
//     }
//   };
//   dd.content.push(tbl);
//   var deduction_amount = 0

//   var amount = 0

//   if(this.obj['GIS']){
//     this.obj['GIS']=this.obj['GIS']
//   }else{
//     this.obj['GIS']=''
//   }  if(this.obj['PF']){
//     this.obj['PF']=this.obj['PF']
//   }else{
//     this.obj['PF']=''
//   }  if(this.obj['IT']){
//     this.obj['IT']=this.obj['IT']
//   }else{
//     this.obj['IT']=''
//   }
//   for (var i = 0; i < this.monthArr.length; i++) {
//     var arr1 = []
    
// arr1.push( i+1)
// arr1.push(this.monthObj[this.monthArr[i]])
// arr1.push(this.total)
// arr1.push(this.obj['GIS'])
// arr1.push(this.obj['PF'])
// arr1.push(this.obj['IT'])
// arr1.push('')




//     dd.content[dd.content.length - 1].table.body.push(arr1);

//   }
//   dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  pdfMake.createPdf(dd).download("LPC-For-Retirement");
} */
/* print2() {

console.log(this.dedArr);

  
  var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + "LPC FOR TRANSFER";
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
  var header1 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  var header2 = {
    columns: [
      {
        width: '*',
        text: '1. Name of Officer/ Employee: ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['emp_name']
      }
      

    ],
  }
  var header21 = {
    columns: [
      {
        width: '*',
        text: '2. Designation of Officer/ Employee :',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['designation_code']
      }
      

    ],
  }
  var header3 = {
    columns: [
      {
        width: '*',
        text: '3. Govt Order and Date :',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['reason_of_retirement_and_date']
      }

    ],
  }
    var header31 = {
    columns: [
 
      {
        width: '*',
        text: '4. Posting Point :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['posting_point']
      }

    ],
  }
  var header4 = {
    columns: [
      {
        width: '*',
        text: '5. Details of salary Mr. '+this.selectedArr['emp_name'] +'('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
      },
      // {
      //   width: '*',
      //   text: '',
      //   bold: true
      // },

      // {
      //   width: '*',
      //   text:''
      // }




    ],
  }
  var header5 = {
    columns: [
      {
        width: '*',
        text: 'Details of Salary',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header6 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  console.log(this.payable);
  var header61 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
 
  // var header71 = {
  //   columns: [
 
  //     {
  //       width: '*',
  //       text: 'Special Allowance:-',
  //       bold: true
  //     },

  //     {
  //       width: '*',
  //       text:this.obj['SA']
  //     }

  //   ],
  // }
  // var header8 = {
  //   columns: [
  //     {
  //       width: '*',
  //       text: 'Day Allowance:-  ',
  //       bold: true,
  //     },

  //     {
  //       width: '*',
  //       text: this.obj['DAA']
  //     }

  //   ],
  // }
  // var header81 = {
  //   columns: [
 
  //     {
  //       width: '*',
  //       text: 'House Rent Allowance:-',
  //       bold: true
  //     },

  //     {
  //       width: '*',
  //       text:this.obj['HRA']
  //     }

  //   ],
  // }
  // var header9 = {
  //   columns: [
  //     {
  //       width: '*',
  //       text: 'City Compensatory Allowance:- ',
  //       bold: true,
     
  //     },

  //     {
  //       width: '*',
  //       text: this.obj['CCA']
  //     }

  //   ],
  // }
  // var header91 = {
  //   columns: [
 
  //     {
  //       width: '*',
  //       text: 'Vehicle Allowance:-',
  //       bold: true
  //     },

  //     {
  //       width: '*',
  //       text:this.obj['VA']
  //     }

  //   ],
  // }
  var header10 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header11 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15

      },

    ],
  }

  var header15 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header151 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header16 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }




  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header1);
  dd.content.push({ text: " " });
  dd.content.push(header2);
  dd.content.push({ text: " " });
  dd.content.push(header21);
  dd.content.push({ text: " " });
  dd.content.push(header3);
  dd.content.push({ text: " " });
  dd.content.push(header31);
  dd.content.push({ text: " " });
  dd.content.push(header4);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });

  dd.content.push(header5);
  dd.content.push({ text: " " });
  dd.content.push(header6);
  dd.content.push({ text: " " });
  dd.content.push(header61);
  dd.content.push({ text: " " });
  for(let i=0;i<this.payableArr.length;i++){
    var header7 = {
      columns: [
        {
          width: '*',
          text:this.payableArr[i]['pay_component_code'] ,
          bold: true,
        },
  
        {
          width: '*',
          text: this.payableArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header7);
    dd.content.push({ text: " " });
  }

  // dd.content.push(header71);
  // dd.content.push({ text: " " });
  // dd.content.push(header8);
  // dd.content.push({ text: " " });
  // dd.content.push(header81);
  // dd.content.push({ text: " " });
  // dd.content.push(header9);
  // dd.content.push({ text: " " });
  dd.content.push(header10);
  
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header11);
  dd.content.push({ text: " " });
  for(let i=0;i<this.dedArr.length;i++){
    var header12 = {
      columns: [
        {
          width: '*',
          text:this.dedArr[i]['pay_component_code'] ,
          bold: true,
        },
  
        {
          width: '*',
          text: this.dedArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header12);
    dd.content.push({ text: " " });
  }
  dd.content.push(header15);
  dd.content.push({ text: " " });
  dd.content.push(header151);
  dd.content.push({ text: " " });
  dd.content.push(header16);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });  
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });





 
  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });


  
  

// console.log(this.monthArr);

//   var tbl = {
//     layout: 'lightHorizontalLines',
//     fontSize: 10,
//     table: {

//       headerRows: 1,
//       widths: ['*','*', '*', '*', '*', '*','*'],
//       body: [
//         [' S No.', 'Month', ' Total Salary', {text:'DA Rate',alignment:'left'}, {text:'Dearness Allowance',alignment:'left'}, {text:'Total',alignment:'left'},{text:'Remark',alignment:'left'}]
//       ],
//     }
//   };
//   dd.content.push(tbl);
//   var deduction_amount = 0

//   var amount = 0
//   if(this.obj['DA']){
//     this.obj['DA']=this.obj['DA']
//   }else{
//     this.obj['DA']=''
//   }
//   for (var i = 0; i < this.monthArr.length; i++) {
//     var arr = []
// arr.push( i+1)
// arr.push(this.monthObj[this.monthArr[i]])
// arr.push('')
// arr.push('17%')
// arr.push(this.obj['DA'])
// arr.push(this.total)
// arr.push('')

//     dd.content[dd.content.length - 1].table.body.push(arr);

//   }
//   dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  
   var header01 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  var header02 = {
    columns: [
      {
        width: '*',
        text: '1. Name of Officer/ Employee: ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['emp_name']
      }
      

    ],
  }
  var header03 = {
    columns: [
      {
        width: '*',
        text: '2. Designation of Officer/ Employee :',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['designation_code']
      }
      

    ],
  }
  var header04 = {
    columns: [
      {
        width: '*',
        text: '3. Govt Order and Date :',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['reason_of_retirement_and_date']
      }

    ],
  }
    var header05 = {
    columns: [
 
      {
        width: '*',
        text: '4. Posting Point :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['posting_point']
      }

    ],
  }
  var header06 = {
    columns: [
      {
        width: '*',
        text: '5. Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
      },
      // {
      //   width: '*',
      //   text: '',
      //   bold: true
      // },

      // {
      //   width: '*',
      //   text:''
      // }




    ],
  }
  var header07 = {
    columns: [
      {
        width: '*',
        text: 'Details of Salary',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header08 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  var header09 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.pay
      }

    ],
  } 
 
  var header016 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header017 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

  var header024 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header025 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header026 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }
  var header027 = {
    columns: [
      {
        width: '*',
        text: 'Details of PF Account',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
  var header028 = {
    columns: [

      {
        width: '*',
        text: '6. Date of Annual Increment:',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['emp_name']
      }

    ],
  }
  var header029 = {
    columns: [

      {
        width: '*',
        text: '7. Releving date :',
        bold: true
      },

      {
        width: '*',
        text:this.selectedArr['designation_code']
      }

    ],
  }
  var header030 = {
    columns: [

      {
        width: '*',
        text: '8. Due leave :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['retirement_date']
      }

    ],
  }
  var header031 = {
    columns: [

      {
        width: '*',
        text: '9. Earned Leave :',
        bold: true
      },

      {
        width: '*',
        text:this.selectObj['posting_point']
      }

    ],
  }
  var header032 = {
    columns: [

      {
        width: '*',
        text: '10. Casual Leave :',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }






  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
 
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header01);
  dd.content.push({ text: " " });
  dd.content.push(header02);
  dd.content.push({ text: " " });
  dd.content.push(header03);
  dd.content.push({ text: " " });
  dd.content.push(header04);
  dd.content.push({ text: " " });
  dd.content.push(header05);
  dd.content.push({ text: " " });
  dd.content.push(header06);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header07);
  dd.content.push({ text: " " });
  dd.content.push(header08);
  dd.content.push({ text: " " });
  dd.content.push(header09);
  dd.content.push({ text: " " });
  for(let i=0;i<this.payableArr.length;i++){
    var header010 = {
      columns: [
        {
          width: '*',
          text:this.payableArr[i]['pay_component_code'] ,
          bold: true,
        },
        {
          width: '*',
          text: this.payableArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header010);
    dd.content.push({ text: " " });
  }
  dd.content.push(header016);
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header017);
  dd.content.push({ text: " " });
  for(let i=0;i<this.dedArr.length;i++){
    var header018 = {
      columns: [
        {
          width: '*',
          text:this.dedArr[i]['pay_component_code'] ,
          bold: true,
        },
  
        {
          width: '*',
          text: this.dedArr[i]['pay_component_amt'] ,
        }
  
      ],
    }
    dd.content.push(header018);
    dd.content.push({ text: " " });
  }
  dd.content.push(header024);
  dd.content.push({ text: " " });
  dd.content.push(header025);
  dd.content.push({ text: " " });
  dd.content.push(header026);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header027);
  dd.content.push({ text: " " });
  dd.content.push(header028);
  dd.content.push({ text: " " });
  dd.content.push(header029);
  dd.content.push({ text: " " });
  dd.content.push(header030);
  dd.content.push({ text: " " });
  dd.content.push(header031);
  dd.content.push({ text: " " });
  dd.content.push(header032);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  



  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  // dd.content.push({ text: " " });

 

  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });


//   var tbl = {
//     layout: 'lightHorizontalLines',
//     fontSize: 10,
//     table: {

//       headerRows: 1,
//       widths: ['*','*', '*', '*', '*', '*','*'],
//       body: [
//         [' S No.', 'Month', ' Total Salary', {text:'GIS',alignment:'left'}, {text:'Providend Fund',alignment:'left'}, {text:'Income Tax',alignment:'left'},{text:'Other Details',alignment:'left'}]
//       ],
//     }
//   };
//   dd.content.push(tbl);
//   var deduction_amount = 0

//   var amount = 0

//   if(this.obj['GIS']){
//     this.obj['GIS']=this.obj['GIS']
//   }else{
//     this.obj['GIS']=''
//   }  if(this.obj['PF']){
//     this.obj['PF']=this.obj['PF']
//   }else{
//     this.obj['PF']=''
//   }  if(this.obj['IT']){
//     this.obj['IT']=this.obj['IT']
//   }else{
//     this.obj['IT']=''
//   }
//   for (var i = 0; i < this.monthArr.length; i++) {
//     var arr1 = []
    
// arr1.push( i+1)
// arr1.push(this.monthObj[this.monthArr[i]])
// arr1.push(this.total)
// arr1.push(this.obj['GIS'])
// arr1.push(this.obj['PF'])
// arr1.push(this.obj['IT'])
// arr1.push('')




//     dd.content[dd.content.length - 1].table.body.push(arr1);

//   }
//   dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  pdfMake.createPdf(dd).download("LPC-For-Transfer");
} */
print3() {
  
  var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " LPC FOR DEATH";
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
  var header1 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  let data=[{key:"1. Name of Officer/ Employee:",value:this.selectedArr['emp_name']},{key:'2. Designation of Officer/ Employee :',value:this.selectedArr['designation_code']},{key:' Date of Death :',value:+this.selectObj['retirement_date']},{key:'4. Posting Point :',value:this.selectObj['posting_point']}]



  var header5 = {
    columns: [
      {
        width: '*',
        text: 'Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

   var header6 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  console.log(this.payable);
  var header61 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
 
  
  var header10 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header11 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15

      },

    ],
  }

  var header15 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header151 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header16 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }




  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header1);
  dd.content.push({ text: " " });
  for(let i=0;i<data.length;i++){
    if(!data[i]["value"]){
      data[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data[0]["key"],data[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data.length; i++) {
      var arr = []
  arr.push(data[i]["key"])
  arr.push(data[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header5);
  dd.content.push({ text: " " });
  dd.content.push(header6);
  dd.content.push({ text: " " });
  dd.content.push(header61);
  dd.content.push({ text: " " });
  if(this.payableArr.length!=0){
  for(let i=0;i<this.payableArr.length;i++){
    if(!this.payableArr[i]["pay_component_code"]){
      this.payableArr[i]["pay_component_amt"]="";
      this.payableArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.payableArr[0]["pay_component_code"],this.payableArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.payableArr.length; i++) {
      var arr = []
  arr.push(this.payableArr[i]["pay_component_code"])
  arr.push(this.payableArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header10);
  
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header11);
  dd.content.push({ text: " " });
  if(this.dedArr.length!=0){
  for(let i=0;i<this.dedArr.length;i++){
    if(!this.dedArr[i]["pay_component_code"]){
      this.dedArr[i]["pay_component_amt"]="";
      this.dedArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl2 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.dedArr[0]["pay_component_code"],this.dedArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl2);
  
  
    for (var i = 1; i < this.dedArr.length; i++) {
      var arr = []
  arr.push(this.dedArr[i]["pay_component_code"])
  arr.push(this.dedArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }

  }dd.content.push({ text: " " });
  dd.content.push(header15);
  dd.content.push({ text: " " });
  dd.content.push(header151);
  dd.content.push({ text: " " });
  dd.content.push(header16);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " }); 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });  
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });

   var header01 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }

  var header07 = {
    columns: [
      {
        width: '*',
        text: ' Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header08 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  var header09 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
  var header016 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header017 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

  var header024 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header025 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header026 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }
  var header027 = {
    columns: [
      {
        width: '*',
        text: 'Details of PF Account',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
  var data1=[{key:'6. Date of Annual Increment:',value:this.selectedArr['emp_name']},{key: '7. Releving date :',value:this.selectedArr['designation_code']},{key:'8. Due leave :',value:this.selectObj['retirement_date']},{key:'9. Earned Leave :',value:this.selectObj['posting_point']},{key:'10. Casual Leave :',value:''}]
 

  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
 
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header01);


  for(let i=0;i<data.length;i++){
    if(!data[i]["value"]){
      data[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data[0]["key"],data[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data.length; i++) {
      var arr = []
  arr.push(data[i]["key"])
  arr.push(data[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
 
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header07);
  dd.content.push({ text: " " });
  dd.content.push(header08);
  dd.content.push({ text: " " });
  dd.content.push(header09);
  dd.content.push({ text: " " });
  if(this.payableArr.length!=0){
  for(let i=0;i<this.payableArr.length;i++){
    if(!this.payableArr[i]["pay_component_code"]){
      this.payableArr[i]["pay_component_amt"]="";
      this.payableArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.payableArr[0]["pay_component_code"],this.payableArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.payableArr.length; i++) {
      var arr = []
  arr.push(this.payableArr[i]["pay_component_code"])
  arr.push(this.payableArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }dd.content.push({ text: " " });
  dd.content.push(header016);
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header017);
  dd.content.push({ text: " " });
  if(this.dedArr.length!=0){
  for(let i=0;i<this.dedArr.length;i++){
    if(!this.dedArr[i]["pay_component_code"]){
      this.dedArr[i]["pay_component_amt"]="";
      this.dedArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.dedArr[0]["pay_component_code"],this.dedArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.dedArr.length; i++) {
      var arr = []
  arr.push(this.dedArr[i]["pay_component_code"])
  arr.push(this.dedArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }dd.content.push({ text: " " });
  dd.content.push(header024);
  dd.content.push({ text: " " });
  dd.content.push(header025);
  dd.content.push({ text: " " });
  dd.content.push(header026);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header027);
  dd.content.push({ text: " " });

  
  for(let i=0;i<data1.length;i++){
    if(!data1[i]["value"]){
      data1[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data1[0]["key"],data1[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data1.length; i++) {
      var arr = []
  arr.push(data1[i]["key"])
  arr.push(data1[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }


  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  var header033 = {
    columns: [

      {
        width: '*',
        text:'Date:',
        bold: true
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      }      ,
      {
        width: '*',
        text: '   Signature:',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }
  dd.content.push(header033);
  dd.content.push({ text: " " });
  var header034 = {
    columns: [

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      }      ,
      {
        width: '*',
        text: '   Designation:',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }
  dd.content.push(header034);
  dd.content.push({ text: " " });


  pdfMake.createPdf(dd).download("LPC-For-Death");
}

print1() {
  
  var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " LPC FOR RETIREMENT";
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
  var header1 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  let data=[{key:"1. Name of Officer/ Employee:",value:this.selectedArr['emp_name']},{key:'2. Designation of Officer/ Employee :',value:this.selectedArr['designation_code']},{key:'3. Date of Death :',value:this.selectObj['reason_of_retirement_and_date']},{key:'4. Posting Point :',value:this.selectObj['posting_point']}]



  var header5 = {
    columns: [
      {
        width: '*',
        text: 'Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

   var header6 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  console.log(this.payable);
  var header61 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
 
  
  var header10 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header11 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15

      },

    ],
  }

  var header15 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header151 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header16 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }




  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header1);
  dd.content.push({ text: " " });
  for(let i=0;i<data.length;i++){
    if(!data[i]["value"]){
      data[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data[0]["key"],data[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data.length; i++) {
      var arr = []
  arr.push(data[i]["key"])
  arr.push(data[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header5);
  dd.content.push({ text: " " });
  dd.content.push(header6);
  dd.content.push({ text: " " });
  dd.content.push(header61);
  dd.content.push({ text: " " });
  if(this.payableArr.length!=0){
  for(let i=0;i<this.payableArr.length;i++){
    if(!this.payableArr[i]["pay_component_code"]){
      this.payableArr[i]["pay_component_amt"]="";
      this.payableArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.payableArr[0]["pay_component_code"],this.payableArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.payableArr.length; i++) {
      var arr = []
  arr.push(this.payableArr[i]["pay_component_code"])
  arr.push(this.payableArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header10);
  
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header11);
  dd.content.push({ text: " " });
  if(this.dedArr.length!=0){
  for(let i=0;i<this.dedArr.length;i++){
    if(!this.dedArr[i]["pay_component_code"]){
      this.dedArr[i]["pay_component_amt"]="";
      this.dedArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl2 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.dedArr[0]["pay_component_code"],this.dedArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl2);
  
  
    for (var i = 1; i < this.dedArr.length; i++) {
      var arr = []
  arr.push(this.dedArr[i]["pay_component_code"])
  arr.push(this.dedArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }

  }
  dd.content.push({ text: " " });
  dd.content.push(header15);
  dd.content.push({ text: " " });
  dd.content.push(header151);
  dd.content.push({ text: " " });
  dd.content.push(header16);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " }); 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });  
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });

   var header01 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }

  var header07 = {
    columns: [
      {
        width: '*',
        text: ' Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header08 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  var header09 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
  var header016 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header017 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

  var header024 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header025 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header026 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }
  var header027 = {
    columns: [
      {
        width: '*',
        text: 'Details of PF Account',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
  var data1=[{key:'6. Date of Annual Increment:',value:this.selectedArr['emp_name']},{key: '7. Releving date :',value:this.selectedArr['designation_code']},{key:'8. Due leave :',value:this.selectObj['retirement_date']},{key:'9. Earned Leave :',value:this.selectObj['posting_point']},{key:'10. Casual Leave :',value:''}]
 

  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
 
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header01);


  for(let i=0;i<data.length;i++){
    if(!data[i]["value"]){
      data[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data[0]["key"],data[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data.length; i++) {
      var arr = []
  arr.push(data[i]["key"])
  arr.push(data[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
 
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header07);
  dd.content.push({ text: " " });
  dd.content.push(header08);
  dd.content.push({ text: " " });
  dd.content.push(header09);
  dd.content.push({ text: " " });
  if(this.payableArr.length!=0){
  for(let i=0;i<this.payableArr.length;i++){
    if(!this.payableArr[i]["pay_component_code"]){
      this.payableArr[i]["pay_component_amt"]="";
      this.payableArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.payableArr[0]["pay_component_code"],this.payableArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.payableArr.length; i++) {
      var arr = []
  arr.push(this.payableArr[i]["pay_component_code"])
  arr.push(this.payableArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header016);
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header017);
  dd.content.push({ text: " " });
  if(this.dedArr.length!=0){
  for(let i=0;i<this.dedArr.length;i++){
    if(!this.dedArr[i]["pay_component_code"]){
      this.dedArr[i]["pay_component_amt"]="";
      this.dedArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.dedArr[0]["pay_component_code"],this.dedArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.dedArr.length; i++) {
      var arr = []
  arr.push(this.dedArr[i]["pay_component_code"])
  arr.push(this.dedArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header024);
  dd.content.push({ text: " " });
  dd.content.push(header025);
  dd.content.push({ text: " " });
  dd.content.push(header026);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header027);
  dd.content.push({ text: " " });

  
  for(let i=0;i<data1.length;i++){
    if(!data1[i]["value"]){
      data1[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data1[0]["key"],data1[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data1.length; i++) {
      var arr = []
  arr.push(data1[i]["key"])
  arr.push(data1[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }


  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  var header033 = {
    columns: [

      {
        width: '*',
        text:'Date:',
        bold:true
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      }      ,
      {
        width: '*',
        text: '   Signature:',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }
  dd.content.push(header033);
  dd.content.push({ text: " " });
  var header034 = {
    columns: [

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      }      ,
      {
        width: '*',
        text: '   Designation:',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }
  dd.content.push(header034);
  dd.content.push({ text: " " });


  pdfMake.createPdf(dd).download("LPC-For-Retirement");
}
print2() {
  
  var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + " LPC FOR TRANSFER";
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
  var header1 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }
  let data=[{key:"1. Name of Officer/ Employee:",value:this.selectedArr['emp_name']},{key:'2. Designation of Officer/ Employee :',value:this.selectedArr['designation_code']},{key:'3. Govt Order and Date :',value:this.selectObj['reason_of_retirement_and_date']},{key:'4. Posting Point :',value:this.selectObj['posting_point']}]



  var header5 = {
    columns: [
      {
        width: '*',
        text: 'Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

   var header6 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  console.log(this.payable);
  var header61 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
 
  
  var header10 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header11 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15

      },

    ],
  }

  var header15 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header151 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header16 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }




  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header1);
  dd.content.push({ text: " " });
  for(let i=0;i<data.length;i++){
    if(!data[i]["value"]){
      data[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data[0]["key"],data[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data.length; i++) {
      var arr = []
  arr.push(data[i]["key"])
  arr.push(data[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header5);
  dd.content.push({ text: " " });
  dd.content.push(header6);
  dd.content.push({ text: " " });
  dd.content.push(header61);
  dd.content.push({ text: " " });
  if(this.payableArr.length!=0){
  for(let i=0;i<this.payableArr.length;i++){
    if(!this.payableArr[i]["pay_component_code"]){
      this.payableArr[i]["pay_component_amt"]="";
      this.payableArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.payableArr[0]["pay_component_code"],this.payableArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.payableArr.length; i++) {
      var arr = []
  arr.push(this.payableArr[i]["pay_component_code"])
  arr.push(this.payableArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header10);
  
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header11);
  dd.content.push({ text: " " });
  if(this.dedArr.length!=0){
  for(let i=0;i<this.dedArr.length;i++){
    if(!this.dedArr[i]["pay_component_code"]){
      this.dedArr[i]["pay_component_amt"]="";
      this.dedArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl2 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.dedArr[0]["pay_component_code"],this.dedArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl2);
  
  
    for (var i = 1; i < this.dedArr.length; i++) {
      var arr = []
  arr.push(this.dedArr[i]["pay_component_code"])
  arr.push(this.dedArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }

  }
  dd.content.push({ text: " " });
  dd.content.push(header15);
  dd.content.push({ text: " " });
  dd.content.push(header151);
  dd.content.push({ text: " " });
  dd.content.push(header16);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " }); 
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });  
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });
  dd.content.push({ text: " " });

   var header01 = {
    columns: [
      {
        width: '*',
        text: 'Last Pay Certificate',
        bold: true,
        alignment:"center",
        fontSize:15
      },

    ],
  }

  var header07 = {
    columns: [
      {
        width: '*',
        text: ' Details of salary Mr. '+this.selectedArr['emp_name'] +' ('+this.selectedArr['designation_code']+') at the time of dated: '+this.selectObj['retirement_date'],
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
   var header08 = {
    columns: [
      {
        width: '*',
        text: 'Pay Scale/ Grade Pay :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectedArr['pay_scale_code']
      }
       ],
  } 
  var header09 = {
    columns: [
   
      {
        width: '*',
        text: 'Pay  :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable
      }

    ],
  } 
 
  var header016 = {
    columns: [
      {
        width: '*',
        text: 'Total:- ',
        bold: true,
      },

      {
        width: '*',
        text: this.payable
      },

    ],
  }
  var header017 = {
    columns: [
      {
        width: '*',
        text: 'Details of Deduction',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }

  var header024 = {
    columns: [
      {
        width: '*',
        text: 'Total Deduction :-',
        bold: true,
      },

      {
        width: '*',
        text: this.deduction
      }

    ],
  }
  var header025 = {
    columns: [

      {
        width: '*',
        text: 'Salary Due :-',
        bold: true
      },

      {
        width: '*',
        text:this.payable-this.deduction
      }

    ],
  }
  var header026 = {
    columns: [
      {
        width: '*',
        text: 'Date :- ',
        bold: true,
      },

      {
        width: '*',
        text: this.selectObj['retirement_date']
      },
    ],
  }
  var header027 = {
    columns: [
      {
        width: '*',
        text: 'Details of PF Account',
        bold: true,
        alignment:'center',
        fontSize:15
      },

    ],
  }
  var data1=[{key:'6. Date of Annual Increment:',value:this.selectedArr['emp_name']},{key: '7. Releving date :',value:this.selectedArr['designation_code']},{key:'8. Due leave :',value:this.selectObj['retirement_date']},{key:'9. Earned Leave :',value:this.selectObj['posting_point']},{key:'10. Casual Leave :',value:''}]
 

  // dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });

  dd.content.push({ text: " " });
 
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header01);


  for(let i=0;i<data.length;i++){
    if(!data[i]["value"]){
      data[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data[0]["key"],data[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data.length; i++) {
      var arr = []
  arr.push(data[i]["key"])
  arr.push(data[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
 
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header07);
  dd.content.push({ text: " " });
  dd.content.push(header08);
  dd.content.push({ text: " " });
  dd.content.push(header09);
  dd.content.push({ text: " " });
  if(this.payableArr.length!=0){
  for(let i=0;i<this.payableArr.length;i++){
    if(!this.payableArr[i]["pay_component_code"]){
      this.payableArr[i]["pay_component_amt"]="";
      this.payableArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.payableArr[0]["pay_component_code"],this.payableArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.payableArr.length; i++) {
      var arr = []
  arr.push(this.payableArr[i]["pay_component_code"])
  arr.push(this.payableArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header016);
  dd.content.push({ text: " " });

  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header017);
  dd.content.push({ text: " " });
  if(this.dedArr.length!=0){
  for(let i=0;i<this.dedArr.length;i++){
    if(!this.dedArr[i]["pay_component_code"]){
      this.dedArr[i]["pay_component_amt"]="";
      this.dedArr[i]["pay_component_code"]="";
    }
  }
  
    var tbl1 = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[this.dedArr[0]["pay_component_code"],this.dedArr[0]["pay_component_amt"]]],
      }
    };
    dd.content.push(tbl1);
  
  
    for (var i = 1; i < this.dedArr.length; i++) {
      var arr = []
  arr.push(this.dedArr[i]["pay_component_code"])
  arr.push(this.dedArr[i]["pay_component_amt"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }
  }
  dd.content.push({ text: " " });
  dd.content.push(header024);
  dd.content.push({ text: " " });
  dd.content.push(header025);
  dd.content.push({ text: " " });
  dd.content.push(header026);
  dd.content.push({ text: " " });
  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  dd.content.push(header027);
  dd.content.push({ text: " " });

  
  for(let i=0;i<data1.length;i++){
    if(!data1[i]["value"]){
      data1[i]["value"]="";
    }
  }
  
    var tbl = {
      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {
  
        headerRows: 0,
        widths: ['*','*'],
        body: [[data1[0]["key"],data1[0]["value"]]],
      }
    };
    dd.content.push(tbl);
  
  
    for (var i = 1; i < data1.length; i++) {
      var arr = []
  arr.push(data1[i]["key"])
  arr.push(data1[i]["value"])
  
  
      dd.content[dd.content.length - 1].table.body.push(arr);
  
    }


  dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 761, y2: 0, lineWidth: 0.05 }] });
  dd.content.push({ text: " " });
  var header033 = {
    columns: [

      {
        width: '*',
        text:'Date:',
        bold:true
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      }      ,
      {
        width: '*',
        text: '   Signature:',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }
  dd.content.push(header033);
  dd.content.push({ text: " " });
  var header034 = {
    columns: [

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      },

      {
        width: '*',
        text:''
      }      ,
      {
        width: '*',
        text: '   Designation:',
        bold: true
      },

      {
        width: '*',
        text:''
      }

    ],
  }
  dd.content.push(header034);
  dd.content.push({ text: " " });


  pdfMake.createPdf(dd).download("LPC-For-Transfer");
}




printlpcretire() { 
  

  let printContents, popupWin;
  printContents = document.getElementById('a').innerHTML;
  popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
  popupWin.document.open();
  popupWin.document.write(`
    <html>
      <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      </head>
      <style>
      #tbl {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        max-width: 2480px;
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        overflow: hidden;
        word-wrap: break-word;
    }
    
    #tbl tr:nth-child(even) {
        background-color: #f2f2f2;
    }
    
    #tbl tr:hover {
        background-color: #ddd;
    }
    .r {
      margin-left: 5px;
      margin-right: 5px;
      background-color: #f2f2f2;
  }
  
  .r1 {
      margin-left: 5px;
      margin-right: 5px;
      background-color: #ddd;
  }
  .r3 {
    text-align: right
}
  
  #h5 {
      font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  }
    #tbl th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
  );
  popupWin.document.close();

 
}
printlpcdeath() { 
  

  let printContents, popupWin;
  printContents = document.getElementById('c').innerHTML;
  popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
  popupWin.document.open();
  popupWin.document.write(`
    <html>
      <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      </head>
      <style>
      #tbl {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        max-width: 2480px;
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        overflow: hidden;
        word-wrap: break-word;
    }
    
    #tbl tr:nth-child(even) {
        background-color: #f2f2f2;
    }
    
    #tbl tr:hover {
        background-color: #ddd;
    }
    .r {
      margin-left: 5px;
      margin-right: 5px;
      background-color: #f2f2f2;
  }
  
  .r1 {
      margin-left: 5px;
      margin-right: 5px;
      background-color: #ddd;
  }
  .r3 {
    text-align: right
}
  
  #h5 {
      font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  }
    #tbl th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
  );
  popupWin.document.close();

 
} 
printlpctransfer() { 
  

  let printContents, popupWin;
  printContents = document.getElementById('b').innerHTML;
  popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
  popupWin.document.open();
  popupWin.document.write(`
    <html>
      <head>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      </head>
      <style>
      #tbl {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        max-width: 2480px;
    }
    
    #tbl td,
    #tbl th {
        border: 1px solid #ddd;
        padding: 8px;
        width: auto;
        overflow: hidden;
        word-wrap: break-word;
    }
    
    #tbl tr:nth-child(even) {
        background-color: #f2f2f2;
    }
    
    #tbl tr:hover {
        background-color: #ddd;
    }
    .r {
      margin-left: 5px;
      margin-right: 5px;
      background-color: #f2f2f2;
  }
  
  .r1 {
      margin-left: 5px;
      margin-right: 5px;
      background-color: #ddd;
  }
  .r3 {
    text-align: right
}
  
  #h5 {
      font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  }
    #tbl th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
    }
      </style>
  <body onload="window.print();window.close()">${printContents}</body>
    </html>`
  );
  popupWin.document.close();

 
}
refresh() {
  this.selectObj={}; 
}


}
