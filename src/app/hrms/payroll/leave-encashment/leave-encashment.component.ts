import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';
declare var $: any;

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { NumberFormatStyle } from '@angular/common';

declare var $: any
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-leave-encashment',
  templateUrl: './leave-encashment.component.html',
  styleUrls: ['./leave-encashment.component.css']
})
export class LeaveEncashmentComponent implements OnInit {


  constructor(public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private payableService: PayrollService) { }
  erpUser;
  b_acct_id;
  arr_id;
  allEmplyees = [];


  selectEmpObj = { total_el: 0, basic: 0, da: 0, amount: 0, paid: 0 }

  codeValueTechObj = {};
  allEmplyees_new = []
  systemDate
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['emp_id', 'emp_name', 'total_el', 'basic', 'da', 'amount', 'retirement_date', 'action'];
  datasource;


  async ngOnInit() {
    this.codeValueTechObj = this.mainService.codeValueTechObj;
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    var resp = await this.payableService.getSystemDate();
    this.systemDate = resp.data
    await this.getAllCurrentArrangements();
    await this.getAllLeaveEncashment();
    await this.getAllPosting();

  }


  postingObj={};
  async getAllPosting(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getAllPosting(obj);
    if(resp['error']==false){
      for(let i=0;i<resp.data.length;i++){
        this.postingObj[resp.data[i]['emp_id']]=resp.data[i]
      }
    }else{

    }
  }

  async getAllLeaveEncashment() {
    this.spinner.show()
    var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.payableService.getLeaveEncashment(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
      var dt = resp.data;
      for(var i=0;i<dt.length;i++){
        dt[i]['emp_id1'] = this.mainService.accInfo['account_short_name']+this.getNumberFormat(dt[i]['emp_id'])
      }
      this.datasource = new MatTableDataSource(dt);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while getting Leave Encashment !!", 'Error', {
        duration: 5000
      });
    }
  }



  getNumberFormat(num) {
    return num.toString().padStart(3, "0")
  }

  allArr = [];
  empDtl = {};
  async getAllCurrentArrangements() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.payableService.getAllCurrentArrangements(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allArr = resp['data'];
      this.empDtl = {};
      this.allEmplyees_new = [];
      for (let i = 0; i < this.allArr.length; i++) {
        this.empDtl[this.allArr[i]['emp_id']] = this.allArr[i];
        var obj = new Object();
        obj = Object.assign({}, this.allArr[i]);
        obj['emp_desc'] = this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name'];
        this.allEmplyees_new.push(obj)
      }
    }
  }

  async changeEmployee() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    for (let i = 0; i < this.allEmplyees_new.length; i++) {
      if (this.allEmplyees_new[i]['emp_id'] == this.selectEmpObj['emp_id']) {
        this.selectEmpObj['retirement_date'] = this.mainService.dateformatchange(this.allEmplyees_new[i]['retirement_date']);
        obj['retirement_date'] =  this.allEmplyees_new[i]['retirement_date'];
      }
    }
    
    var resp = await this.payableService.getEL(JSON.stringify(obj));
    if (resp['error'] == false) {
      if (resp.data.length > 0) {
        this.selectEmpObj['total_el'] = resp.data[0]['leaves_remaining'];
      } else {
        this.selectEmpObj['total_el'] = 0;
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
    }
    this.spinner.hide();

    this.selectEmpObj['basic'] = 0;
    this.selectEmpObj['da'] = 0;
    this.selectEmpObj['amount'] = 0;
    this.selectEmpObj['paid'] = 0;
  }

  fixedpay = [];
  async submit() {
    var obj = new Object();
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    obj['b_acct_id'] = this.b_acct_id;

    var resp = await this.payableService.getAllFixedPay(obj);
    if (resp['error'] == false) {
      this.fixedpay = resp.data;
      for (let i = 0; i < this.fixedpay.length; i++) {
        var obj = new Object();
        obj = Object.assign(this.fixedpay[i]);
        if (obj['effective_end_dt'] >= this.systemDate && obj['pay_component_code'] == 'DA') {
          this.selectEmpObj['da'] = obj['pay_component_amt'];
        }
        if (obj['effective_end_dt'] >= this.systemDate && obj['pay_component_code'] == 'BASIC') {
          this.selectEmpObj['basic'] = obj['pay_component_amt'];
        }
      }

      var amount = (((this.selectEmpObj['basic'] + this.selectEmpObj['da']) * this.selectEmpObj['total_el']) / 30).toFixed(2);
      this.selectEmpObj['amount'] = parseFloat(amount);
      this.total_amount = parseFloat(amount);

      this.spinner.hide();
    } else {
      this.spinner.hide();
    }
  }
  total_amount = 0;
  changePaidAmount() {

    this.selectEmpObj['amount'] = this.total_amount - this.selectEmpObj['paid'];
  }


  async deletefLeaveEncashment(element) {

    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];

    var resp = await this.payableService.deleteLeaveEncashment(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllLeaveEncashment();
      this.spinner.hide();
      this.snackBar.open("Deleted Successfully", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleting Leave Encashment!!", 'Error', {
        duration: 5000
      });
    }
  }
  
  async openUpdate(element) {
    $('.nav-tabs a[href="#tab-3"]').tab('show');
    this.selectEmpObj = Object.assign({}, element);
    this.selectEmpObj['retirement_date']=this.mainService.dateformatchange(this.selectEmpObj['retirement_date'])
    this.total_amount = this.selectEmpObj['amount'] + this.selectEmpObj['paid'];
    await this.changePaidAmount();

  }

  async submitLeaveEncashment() {


    for (let i = 0; i < this.allArr.length; i++) {
      if (this.allArr[i]['emp_id'] == this.selectEmpObj['emp_id']) {
        this.selectEmpObj['emp_name'] = this.allArr[i]['emp_name'];
      }
    }


    this.selectEmpObj['b_acct_id'] = this.b_acct_id;
    this.selectEmpObj['create_user_id'] = this.erpUser.user_id;

    console.log(this.selectEmpObj);
    this.spinner.show();
    var resp = await this.payableService.createLeaveEncashment(this.selectEmpObj);
    if (resp['error'] == false) {
      await this.getAllLeaveEncashment();
      this.selectEmpObj = { total_el: 0, basic: 0, da: 0, amount: 0, paid: 0 }
      this.spinner.hide();
      this.snackBar.open("Leave Encashment Added Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Leave Encashment !!", 'Error', {
        duration: 5000
      });
    }
  }

  async updateLeaveEncashment() {
    this.selectEmpObj['b_acct_id'] = this.b_acct_id;
    this.selectEmpObj['update_user_id'] = this.erpUser.user_id;
    this.spinner.show();

    var resp = await this.payableService.updateLeaveEncashment(this.selectEmpObj);
    if (resp['error'] == false) {
      await this.getAllLeaveEncashment();

      this.spinner.hide();
      this.snackBar.open("Leave Encashment Update Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while update Leave Encashment !!", 'Error', {
        duration: 5000
      });
    }
  }


  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


  download(element) {
    this.print(element);
  }
  print(data) {

    var obj = Object.assign({}, data)
    var txt = this.mainService.accInfo['account_name'] + "(" + this.mainService.accInfo['account_short_name'] + ")" + "   Leave Encashment";
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var obj = { text: txt + "     Page No. - " + currentPage, alignment: 'center', margin: [72, 40] };
        return obj;
      },

      //footer: function(currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount; },

      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'landscape',

      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [40, 60, 40, 60],
      //pageMargins: [ 40, 20, 20, 20 ],
      content: [

      ]
    };



    var headertemp = {
      columns: [
        {
          width: '*',
          text: 'Department Name : '+this.postingObj[obj['emp_id']]['section_code'],
          bold: true
        },
        {
          width: '*',
          text: ''
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
    dd.content.push({ text: " " });
    dd.content.push(headertemp);
    dd.content.push({ text: " " });


    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });

    var tbl = {

      layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],

        body: [
          ['Emp Dtl', 'Basic Pay', 'DA/Relief', 'Dep. Allow', 'Med Allow', 'Vehicle Allow', 'HRA', 'Wash Allow', 'Misc\nAllow', 'Total', 'LIC', 
          'PF\nDed', 'Group Ins.', 'IT', 'House\n Rent', 'Vehicle\nDed', 'Vehicle\nAdv.', 'Bld\nAdv.', 'PF\nAdv.',
           'Bank\nAdv.', 'EWF', 'Misc Ded', 'Net.Sal.']
        ]
      }
    };
    dd.content.push(tbl);




    var arr = [];
    var str = this.mainService.accInfo['account_short_name'] + this.getNumberFormat(obj['emp_id']) 
    + "\n" + obj['emp_name'] 
    + "\n" + this.empDtl[obj['emp_id']]['designation_code'] 
    + "\n" + "GP - " + this.empDtl[obj['emp_id']]['grade_pay_code'] 
    + "\n" + "PB - " + this.empDtl[obj['emp_id']]['pay_scale_code'];
    var t1={
      text : str,
      bold : true
    }
    arr.push(t1);
    var t2={
      text : obj['basic'],
      
    }
    var t3={
      text : obj['da'],
      
    }
    arr.push(t2);
    arr.push(t3);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0.00);
    var t4 ={
      
      text: obj['basic']+obj['da'],
      bold: true
    };
    arr.push(t4);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0.00);
    var t5 ={
      
      text: obj['basic']+obj['da'],
      bold: true
    };
    arr.push(t5);
    dd.content[dd.content.length - 1].table.body.push(arr);





    var arr = [];
    var str = "TOTAL";
    var t6={
      text : str,
      bold : true
    };
    arr.push(t6);
    var t7={
      text : obj['basic'],
      bold : false
    };
    arr.push(t7);
    var t8={
      text : obj['da'],
      bold : false
    };
    arr.push(t8);
    arr.push(0);
    
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0.00);
    var t9={
      text : obj['basic']+obj['da'],
      bold : true
    };
    arr.push(t9);
    
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0);
    arr.push(0.00);
    var t10={
      text : obj['basic']+obj['da'],
      bold : true
    };
    arr.push(t10);
    dd.content[dd.content.length - 1].table.body.push(arr);

    var headerf1 = {
      columns: [
        {
          width: '15%',
          text: (obj['basic']+obj['da'])+' x '+obj['total_el'],
          bold: true,
          alignment:'center'

        },
        {
          width: '*',
          text: ''
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
    var headerf2 = {
      columns: [
        {
          width: '15%',
          text: '30',
          bold: true,
          alignment:'center'
        },
        {
          width: '*',
          text: ''
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


    var header0 = {
      columns: [
        {
          width: '*',
          text: 'Total Earn Leave :',
          bold: true
        },
        {
          width: '*',
          text: obj['total_el']
        },
        {

          width: '*',
          text: '',
          bold: true
        }
      ],

    }
    
    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Amount To Be Paid :',
          bold: true
        },
        {
          width: '*',
          text: (obj['basic']+obj['da'])+' x '+obj['total_el']+"/ 30  ="+(obj['amount'] + obj['paid'])
        },
        {

          width: '*',
          text: "",
          bold: true
        }
      ],

    }

    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Already Paid :',
          bold: true
        },
        {
          width: '*',
          text: obj['paid']
        },
        {

          width: '*',
          text: '',
          bold: true
        }
      ],
    }

    var str = this.convertNumberToWords(obj['amount'])
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'Payable Amount :',
          bold: true
        },
        {
          width: '*',
          text: obj['amount']
        },
        {

          width: '*',
          text: " ( Rs. "+str.toUpperCase()+" only )",
          bold: true
        },
        
      ],
    }

    var header4 = {
      columns: [
        {
          width: '*',
          text: 'Remark :',
          bold: true
        },
        {
          width: '*',
          text: ''
        }

      ],
    }
    var header5 = {
      columns: [
        {
          width: '*',
          text: 'PREPARED BY :',
          bold: true
        },
        {
          width: '*',
          text: 'CHECKED BY',
          bold: true
        },
        {
          width: '*',
          text: 'SIGNED BY :',
          bold: true
        },

      ],
    }

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });




    // dd.content.push({ text: " " });
    // dd.content.push(headerf1);
    // dd.content.push({ canvas: [{ type: 'line', x1: 38, y1: 0, x2: 125, y2: 0, lineWidth: 0.5 }] });
    // dd.content.push(headerf2);
    dd.content.push({ text: " " });
    dd.content.push(header0);
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

    pdfMake.createPdf(dd).download(obj['emp_name']+"-el-encash");
  }
   convertNumberToWords(amount) {
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    var paisaObj={'0':'Zero','1':"One",'2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine'}
    amount = amount.toString();
    var p =""
    var xp = amount.split(".");
    if(xp[1]!=undefined){
      p=xp[1];
    }
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
            received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
            n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                if (n_array[i] == 1) {
                    n_array[j] = 10 + parseInt(n_array[j].toString());
                    n_array[i] = 0;
                }
            }
        }
        var value = -1;
        for (var i = 0; i < 9; i++) {
            if (i == 0 || i == 2 || i == 4 || i == 7) {
                value = n_array[i] * 10;
            } else {
                value = n_array[i];
            }
            if (value != 0) {
                words_string += words[value] + " ";
            }
            if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Crores ";
            }
            if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Lakhs ";
            }
            if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
                words_string += "Thousand ";
            }
            if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
                words_string += "Hundred and ";
            } else if (i == 6 && value != 0) {
                words_string += "Hundred ";
            }
        }
        words_string = words_string.split("  ").join(" ");
    }
    if(p!=""){
      if(p.charAt(0)!=undefined && p.charAt(0)!=''){
        words_string+=" point "+paisaObj[p.charAt(0)];
      }
      if(p.charAt(1)!=undefined && p.charAt(1)!=''){
        words_string+=" "+paisaObj[p.charAt(1)];
      }
    }
    return words_string;
}

}
