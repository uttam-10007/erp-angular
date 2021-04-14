import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';
import { EstablishmentService } from '../../service/establishment.service';
import { AllEmpService } from '../../service/all-emp.service'
import pdfMake from "pdfmake/build/pdfmake";
declare var $: any

@Component({
  selector: 'app-salary-slip',
  templateUrl: './salary-slip.component.html',
  styleUrls: ['./salary-slip.component.css']
})
export class SalarySlipComponent implements OnInit {

  constructor(private allEmpService: AllEmpService, private establishmentService: EstablishmentService, public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  emp_id
  b_acct_id;
  salarySlipArr = [];
  selectObj = {};
  allArr = [];
  payableArr = [];
  dedArr = [];
  payable = 0;
  deduction = 0;
  total = 0;
  lines = [];
  selectedArr = {}
  bankObj = {};
  personalInfoObj = {};
  allEmplyees_new = []
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllCurrentArrangements();

  }
  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }

  async getAllCurrentArrangements() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;

    var resp = await this.payableService.getAllCurrentArrangements(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allArr = resp['data'];
      this.allEmplyees_new = [];
      for (let i = 0; i < this.allArr.length; i++) {
        var obj = new Object();
        obj = Object.assign({}, this.allArr[i]);
        obj['emp_name'] =this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+" - "+ obj['emp_name'];
        this.allEmplyees_new.push(obj)
      }

    }else{
      this.spinner.hide()

    }
  }

  async getPaySlip() {
    this.oneclickslip = [];
    this.payableArr = [];
    this.dedArr = [];
    this.payable = 0;
    this.deduction = 0;
    this.total = 0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    obj['fin_year'] = this.selectObj['fin_year'];
    obj['month'] = this.selectObj['month'];

    this.emp_id = this.getNumberFormat(obj['emp_id'])

    this.spinner.show();
    var resp = await this.payableService.getSalarySlip(JSON.stringify(obj));
    if (resp['error'] == false) {

      this.salarySlipArroneclick = resp.data;
      this.ind(this.selectObj['emp_id']);

      /*  this.buildSlip();
       this.getArr();
       this.getPersonalInfo(); */
      //this.getBankInfo();
      this.spinner.hide();
    } else {
      this.spinner.hide();
    }
  }
  salarySlipArroneclick = []
  async getoneclickPaySlip() {
    this.oneclickslip = [];
    this.payableArr = [];
    this.dedArr = [];
    this.payable = 0;
    this.deduction = 0;
    this.total = 0;
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    //obj['emp_id'] = this.selectObj['emp_id'];
    obj['fin_year'] = this.selectObj['fin_year'];
    obj['month'] = this.selectObj['month'];

    //this.emp_id = this.getNumberFormat(obj['emp_id'])

    this.spinner.show();
    var resp = await this.payableService.getSalarySlip(JSON.stringify(obj));
    if (resp['error'] == false) {

      this.salarySlipArroneclick = resp.data;
      this.oneclick()

      /*  this.buildSlip();
       this.getArr();
       this.getPersonalInfo(); */
      //this.getBankInfo();
      this.spinner.hide();
    } else {
      this.spinner.hide();
    }
  }
  personalinfo = []
  async oneclick() {
    var Obj = new Object();
    Obj['b_acct_id'] = this.b_acct_id;
    this.spinner.show();
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(Obj));
    if (resp['error'] == false) {
      this.personalinfo = resp.data;
      this.buildoneclickslip("one_click")
    }
  }
  async ind(emp_id) {
    var Obj = new Object();
    Obj['b_acct_id'] = this.b_acct_id;
    Obj['emp_id'] = emp_id;
    this.spinner.show();
    var resp = await this.allEmpService.getEmployeeMasterData(JSON.stringify(Obj));
    if (resp['error'] == false) {
      this.personalinfo = resp.data;
      this.buildoneclickslip("payslip")
    }
  }



  async getPersonalInfo() {
    this.personalInfoObj = {};
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectObj['emp_id'];
    this.spinner.show();
    var resp = await this.allEmpService.getPersonalInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.personalInfoObj = resp.data[0];
    }else{
      this.spinner.hide()
    }
  }
  oneclickslip = []
  async buildoneclickslip(name) {
    this.spinner.show();
    for (var i = 0; i < this.personalinfo.length; i++) {
      this.payableArr = [];
      this.dedArr = [];
      this.payable = 0;
      this.deduction = 0;
      this.total = 0;
      var obj = new Object();
      obj = this.personalinfo[i]
      for (var j = 0; j < this.allArr.length; j++) {
        if (this.allArr[j].emp_id == obj['emp_id']) {
          this.selectedArr = this.allArr[j];
        }
      }
      for (var k = 0; k < this.salarySlipArroneclick.length; k++) {
        if (this.salarySlipArroneclick[k].emp_id == obj['emp_id']) {
          if (this.salarySlipArroneclick[k].pay_code == 'PAY') {
            this.payableArr.push(this.salarySlipArroneclick[k]);
            this.payable += this.salarySlipArroneclick[k].pay_component_amt;
          } else if ((this.salarySlipArroneclick[k].pay_code == 'DED')) {
            this.dedArr.push(this.salarySlipArroneclick[k]);
            this.deduction += this.salarySlipArroneclick[k].pay_component_amt;
          }
        }
      }
      if (this.payableArr.length > this.dedArr.length) {
        this.lines = this.payableArr;
      } else {
        this.lines = this.dedArr;
      }
      this.total = parseFloat((this.payable - this.deduction).toFixed(2));

      obj['emp_id'] = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id'])
      if (this.lines.length > 0) {
        var Obj = new Object();
        Obj['personalInfoObj'] = obj
        Obj['selectedArr'] = this.selectedArr
        Obj['payableArr'] = this.payableArr
        Obj['payable'] = this.payable
        Obj['dedArr'] = this.dedArr
        Obj['deduction'] = this.deduction
        Obj['lines'] = this.lines
        Obj['total'] = this.total
        this.oneclickslip.push(Obj)
      }
    }
    this.print1(name)
    this.spinner.hide();
  }


  async getArr() {

    for (var i = 0; i < this.allArr.length; i++) {
      if (this.allArr[i].emp_id == this.selectObj['emp_id']) {
        this.selectedArr = this.allArr[i];
      }
    }
  }
 
  
  async print1(name) {


    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")";
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var arr = []
        var obj = { text: txt, alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj);
        return arr;
      },
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };

    for (var l = 0; l < this.oneclickslip.length; l++) {
      var personalInfoObj = this.oneclickslip[l]['personalInfoObj']
      var selectedArr = this.oneclickslip[l]['selectedArr']
      var payable = this.oneclickslip[l]['payable']
      var dedArr = this.oneclickslip[l]['dedArr']
      var deduction = this.oneclickslip[l]['deduction']
      var lines = this.oneclickslip[l]['lines']
      var total = this.oneclickslip[l]['total']
      var payableArr = this.oneclickslip[l]['payableArr']
      var header0 = {
        columns: [
          {
            width: '*',
            text: 'Salary Slip for ' + this.mainService.codeValueShowObj['HR0024'][this.selectObj['month']] + "/" + this.mainService.codeValueShowObj['HR0023'][this.selectObj['fin_year']],
            bold: true,
            alignment: 'center'
          }
        ],

      }

      var header1 = {
        columns: [
          {
            width: '*',
            text: 'Employee ID :',
            bold: true
          },
          {
            width: '*',
            text: personalInfoObj['emp_id']
          },
          {

            width: '*',
            text: 'Employee Name :',
            bold: true
          },
          {
            width: '*',
            text: personalInfoObj['emp_name']
          }
        ],

      }
      var header2 = {
        columns: [
          {
            width: '*',
            text: 'Employee Phone Number :',
            bold: true

          },
          {
            width: '*',
            text: personalInfoObj['emp_phone_no']
          },
          {
            width: '*',
            text: 'Employee Pan Number :',
            bold: true
          },
          {
            width: '*',
            text: personalInfoObj['emp_pan_no']
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
            text: this.mainService.codeValueShowObj['HR0011'][selectedArr['designation_code']]
          },
          {
            width: '*',
            text: 'Cadre :',
            bold: true
          },
          {
            width: '*',
            text: this.mainService.codeValueShowObj['HR0013'][selectedArr['cadre_code']]
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
            text: this.mainService.codeValueShowObj['HR0014'][selectedArr['class_code']]
          },
          {
            width: '*',
            text: 'Account No. :',
            bold: true
          },
          {
            width: '*',
            text: personalInfoObj['acct_no']
          }
        ],

      }
      var header5 = {
        columns: [
          {
            width: '*',
            text: 'IFSC Code :',
            bold: true

          },
          {
            width: '*',
            text: personalInfoObj['ifsc_code']
          },
          {
            width: '*',
            text: 'Bank :',
            bold: true
          },
          {
            width: '*',
            text: personalInfoObj['bank_code']
          }
        ],

      }
      if(personalInfoObj['pf_acct_no'] == 0){
        personalInfoObj['pf_acct_no']="NA"
      }
      var header6 = {
        columns: [
          {
            width: '*',
            text: 'PF Account Number :',
            bold: true

          },
          {
            width: '*',
            text: personalInfoObj['pf_acct_no']
          },
          {
            width: '*',
            text: '',
            bold: true
          },
          {
            width: '*',
            text: ''
          }
        ],

      }
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }] });
      dd.content.push(header0);

      dd.content.push({ text: " " });
      dd.content.push(header1);

      dd.content.push(header2);

      dd.content.push(header3);
      dd.content.push(header4);
      dd.content.push(header5);
      dd.content.push(header6);
      dd.content.push({ text: " " });

      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }] });


      var header8 = {
        columns: [
          {
            width: '*',
            text: 'PAYABLES',
            bold: true,
            alignment: 'left'
          },
          {
            width: '*',
            text: 'AMOUNT',
            bold: true,
            alignment: 'left'
          },
          {
            width: '*',
            text: 'DEDUCTIONS',
            bold: true,
            alignment: 'left'
          },
          {
            width: '*',
            text: 'AMOUNT',
            bold: true,
            alignment: 'left'
          }
        ],


      }
      dd.content.push(header8);
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }] });
      dd.content.push({ text: " " });
      var objSort = {'BASIC':{},'DA':{},'HRA':{},'VA':{},'WA':{}};
      var sortArr=[];
      for(var i=0;i<payableArr.length;i++){
        if(objSort[payableArr[i]['pay_component_code']]!=undefined){
          objSort[payableArr[i]['pay_component_code']]=payableArr[i];
        }else{
          objSort[payableArr[i]['pay_component_code']]=payableArr[i];

        }
      }
      var keys = Object.keys(objSort);

      for(var i=0;i<keys.length;i++){
        if(objSort[keys[i]]['pay_component_code']!=undefined && objSort[keys[i]]['pay_component_amt']!=0){
          sortArr.push(objSort[keys[i]]);

        }
      }
      payableArr = sortArr;
      for (var i = 0; i < lines.length; i++) {


        var objRow = { columns: [], }


        var text_temp = '';
        if (i < payableArr.length) {
          text_temp = this.mainService.codeValueShowObj['HR0021'][payableArr[i]['pay_component_code']]
          objRow['columns'].push({
            width: '*',
            text: text_temp,
            alignment: 'left',
          })
        }else{
          objRow['columns'].push({
            width: '*',
            text: "",
            alignment: 'left',
          })
        }
        
        var pay_component_amtpay = '';
        if (i < payableArr.length) {
          pay_component_amtpay = payableArr[i]['pay_component_amt'].toFixed(2);
          objRow['columns'].push({
            width: '*',
            text: pay_component_amtpay,
            alignment: 'left',
          })
        }else{
          objRow['columns'].push({
            width: '*',
            text: "",
            alignment: 'left',
          })
        }
       
        var pay_component_codeded = '';
        if (i < dedArr.length) {
          pay_component_codeded = this.mainService.codeValueShowObj['HR0021'][dedArr[i]['pay_component_code']];
          objRow['columns'].push({
            width: '*',
            text: pay_component_codeded,
            alignment: 'left',
          })
        }else{
          objRow['columns'].push({
            width: '*',
            text: "",
            alignment: 'left',
          })
        }
        
        var pay_component_amtded;
        if (i < dedArr.length) {
          pay_component_amtded = dedArr[i]['pay_component_amt'].toFixed(2);
          objRow['columns'].push({
            width: '*',
            text: pay_component_amtded,
            alignment: 'left',
          })
        }else{
          objRow['columns'].push({
            width: '*',
            text: "",
            alignment: 'left',
          })
        }
        




        dd.content.push(objRow);
        dd.content.push({ text: " " });
      }
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 2 }] });
      dd.content.push({ text: " " });


      var totalObjRow = {
        columns: [

          {
            width: '*',
            text: 'Total Payable : Rs. ',
            bold: true

          },
          {
            width: '*',
            text: payable.toFixed(2),
          },
          {
            width: '*',
            text: 'Total Deductions : Rs.',
            bold: true
          },
          {
            width: '*',
            text: deduction.toFixed(2)
          },


        ],

      }
      dd.content.push(totalObjRow);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 2 }] });
      dd.content.push({ text: " " });
      var totalObjRow = {
        columns: [

          {
            width: '*',
            text: '',
            bold: true

          },
          {
            width: '*',
            text: '',
          },
          {
            width: '*',
            text: 'Net Payable : Rs.',
            bold: true
          },
          {
            width: '*',
            text: total.toFixed(2)
          },


        ],

      }
      dd.content.push(totalObjRow);
      dd.content.push({ text: " " });
      dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 2 }] });
      dd.content.push({ text: " " });
      dd.content.push({ text: " " });
      dd.content.push({ text: " " });
      var sig = {
        columns: [

          {
            width: '*',
            text: "Note : This is an electronically generated document and does not require signature",
            bold: true
          }


        ],

      }
      dd.content.push(sig);
      if (l <= this.oneclickslip.length - 2) {
        dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5 }], pageBreak: 'before' });
      }
    }
    pdfMake.createPdf(dd).download(name+'.pdf');

  }
}
