import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ThrowStmt } from '@angular/compiler';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApplicationService } from '../../service/application.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchemeService } from '../../service/scheme.service';
import { SubSchemeService } from '../../service/sub-scheme.service';
import {MainService} from '../../service/main.service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
declare var $: any
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;

  @ViewChild('paginator2', { static: false }) paginator2: MatPaginator;
  @ViewChild('sortCol3', { static: false }) sortCol3: MatSort;
  constructor(private sanitizer: DomSanitizer,public mainService: MainService,private subSchemeService: SubSchemeService, private schemeService: SchemeService, private applicationService: ApplicationService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }
  dataSource;
  displayedColumns = ['party_id', 'party_name', 'applied_date', 'application_amount', 'application_challan_no', 'arr_status_code', 'action'];
  dataSource2;
  displayedColumns2 = ['party_id', 'co_applicant_name', 'co_applicant_father_or_husband_name', 'co_applicant_email', 'co_applicant_phone_no', 'co_applicant_adhar_no', 'co_applicant_annual_income','co_applicant_religion','co_applicant_photo_file_name','co_applicant_sig_file_name'];
 
  schemeArr = [];
  schemeObj = {};
  statusArr=[{code:"APPLICATION_APPROVAL_PENDING",value:"APPLICATION_APPROVAL_PENDING"},{code:"APPLICATION_APPROVED",value:"APPLICATION_APPROVED"},{code:"APPLICATION_REFILL",value:"APPLICATION_REFILL"},{code:"APPLICATION_REJECTED",value:"APPLICATION_REJECTED"}]
  displayedColumns1 = ['party_id', 'party_name', 'applied_date', 'application_amount', 'application_challan_no', 'arr_status_code'];
  status=''
  obj = {};
  obj1 = {};
  fileURL
  coApplicantFileURL
  allApplications = [];
  viewDocumentObj={}
  b_acct_id;
  erpUser;

  dataSource1
  allSubSchemes = [];
  allSubSchemes1=[]
  subSchemeObj = {};
  partyCoApplicantObj={}
  flag=false
statusDataArr=[]
  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllSchemes();
  }
  async getAllSchemes() {
    this.spinner.show();

    var resp = await this.schemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      for (let i = 0; i < this.schemeArr.length; i++) {
        this.schemeObj[this.schemeArr[i]['scheme_code']] = this.schemeArr[i]['scheme_name']
      }
      this.spinner.hide();

    } else {
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
      this.spinner.hide();

    }
  }


  async changeScheme() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code']
    var resp = await this.subSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.allSubSchemes = resp.data;
      for (let i = 0; i < this.allSubSchemes.length; i++) {
        this.subSchemeObj[this.allSubSchemes[i]['sub_scheme_code']] = this.allSubSchemes[i]['sub_scheme_name']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub-Schemes", 'Error', {
        duration: 5000,
      });
    }
  }

  async changeScheme1() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj1['scheme_code']
    var resp = await this.subSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.allSubSchemes1 = resp.data;
      // for (let i = 0; i < this.allSubSchemes.length; i++) {
      //   this.subSchemeObj[this.allSubSchemes[i]['sub_scheme_code']] = this.allSubSchemes[i]['sub_scheme_name']
      // }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub-Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
 async getStatusApplications(){
  this.spinner.show();

  var obj = new Object();
  obj['b_acct_id'] = this.b_acct_id;
  obj['scheme_code'] = this.obj1['scheme_code']
  obj['sub_scheme_code'] = this.obj1['sub_scheme_code']
  var resp = await this.applicationService.getAllApplications(obj);
  if (resp['error'] == false) {
    var tempArr = resp.data;
      var arr=[]
  
      for(let i=0;i<tempArr.length;i++){
        if(tempArr[i]['arr_status_code']==this.obj1['status']){
          arr.push(tempArr[i])
        }
      }
      this.statusDataArr=arr
        this.dataSource1 = new MatTableDataSource(this.statusDataArr);
        this.dataSource1.sort = this.sortCol2;
        this.dataSource1.paginator = this.paginator1;
        this.spinner.hide();

  } else {
    this.spinner.hide();

    this.snackBar.open("Error occured while getting Applications", 'Error', {
      duration: 5000,
    });
  }
  }

  async getApplications() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code']
    obj['sub_scheme_code'] = this.obj['sub_scheme_code']
    var resp = await this.applicationService.getAllApplications(obj);
    if (resp['error'] == false) {
      this.allApplications = resp.data;
      this.dataSource = new MatTableDataSource(this.allApplications);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();

      this.snackBar.open("Error occured while getting Applications", 'Error', {
        duration: 5000,
      });
    }
  }


  async reject(element, i) {
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id
    obj['arr_status_code'] = 'APPLICATION_REJECTED'
    this.spinner.show()
    var resp = await this.applicationService.changeApplicationStatus(obj);
    if (resp['error'] == false) {
      await this.getApplications()

      this.spinner.hide();
      this.snackBar.open("Rejected Successfully", 'Success', {
        duration: 5000,
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
  }

  async refill(element, i) {
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id
    obj['arr_status_code'] = 'APPLICATION_REFILL'
    this.spinner.show()
    var resp = await this.applicationService.changeApplicationStatus(obj);
    if (resp['error'] == false) {
      await this.getApplications()

      this.spinner.hide();
      this.snackBar.open("Refill Successfully", 'Success', {
        duration: 5000,
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
  }



  async approve(element, i) {
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id
    obj['arr_status_code'] = 'APPLICATION_APPROVED'
    this.spinner.show()
    var resp = await this.applicationService.changeApplicationStatus(obj);
    if (resp['error'] == false) {
      await this.getApplications()
      this.spinner.hide();
      this.snackBar.open("Approved Successfully", 'Success', {
        duration: 5000,
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
  }


async changeStatus(){
 var arr=[]
  
    for(let i=0;i<this.allApplications.length;i++){
      if(this.allApplications[i]['arr_status_code']==this.status){
        arr.push(this.allApplications[i])
      }
    }
    this.statusDataArr=arr
      this.dataSource1 = new MatTableDataSource(this.statusDataArr);
      this.dataSource1.sort = this.sortCol2;
      this.dataSource1.paginator = this.paginator1;
  
  
}
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter1(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }
  applyFilter2(filterValue: string) {
    this.dataSource2.filter = filterValue.trim().toLowerCase();
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
      
      #tbl th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: rgb(63, 24, 233);
          color: white;
      }
      
    
    table {
        width: 100%;
    }
    
    
        </style>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();


  }
  async print2() {
   let ob={}
   for(let i=0;i<this.schemeArr.length;i++){
     if(this.schemeArr[i]['scheme_code']==this.obj1['scheme_code']){
       ob['scheme_name']=this.schemeArr[i]['scheme_name']
     }
   }
   for(let i=0;i<this.allSubSchemes1.length;i++){
    if(this.allSubSchemes1[i]['sub_scheme_code']==this.obj1['sub_scheme_code']){
      ob['sub_scheme_name']=this.allSubSchemes1[i]['sub_scheme_name']
    }
  }
    let data = []
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
          text: 'Applcation',
          bold: true,
          alignment: 'center'
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
          text: ob['scheme_name']
        },
        {
          width: '*',
          text: 'Sub Scheme :',
          bold: true
        },

        {
          width: '*',
          text:ob['sub_scheme_name']
        }

      ],
    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Status :',
          bold: true
        },
        {
          width: '*',
          text: this.obj1['status']
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
  

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header0);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push({ text: " " });
    dd.content.push(header2);
    dd.content.push({ text: " " });

    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1110, y2: 0, lineWidth: 0.05 }] });
    var tbl = {

      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*', '*'],
        body: [
          ['Application ID', 'Applicant Name', 'Applied Date', {text:'Application Amount',alignment:'right'}, 'Challan ID']
        ],
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < this.statusDataArr.length; i++) {
      var arr = []
      arr.push(this.statusDataArr[i]['party_id']);
      arr.push(this.statusDataArr[i]['party_name']);
      arr.push({text:this.mainService.dateFormatChange(this.statusDataArr[i]['applied_date']),alignment:'left'});
      arr.push({text:this.statusDataArr[i]['application_amount'],alignment:'right'});
      arr.push({text:this.statusDataArr[i]['application_challan_no'],alignment:'left'});
    
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    dd.content.push({ text: " " });
    this.spinner.hide()
    pdfMake.createPdf(dd).download("application");
  }
 async viewDocuments(element,i){
   this.fileURL=''
this.viewDocumentObj=element
  $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
async view(filename){
  this.spinner.show()
var obj=new Object
obj['filename']=this.viewDocumentObj[filename]
obj['b_acct_id']=this.b_acct_id
obj['sub_scheme_code']=this.viewDocumentObj['sub_scheme_code']
obj['party_id']=this.viewDocumentObj['party_id']
  const res = await this.applicationService.getUploadedFileofparty(obj);
  if (res) {
    // const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
    // this.fileURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
    this.spinner.hide()
    var docname = obj['filename'];
    var ext = docname.split('.');
    
     if(ext[1] == 'png' || ext[1] == 'jpeg' || ext[1] == 'jpg' || ext[1] == 'PNG' || ext[1] == 'JPEG' || ext[1] == 'JPG'){
       const unsafeImageUrl = window.URL.createObjectURL(res);
       this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeImageUrl);


     }else{
       let file = new Blob([res], { type: 'application/pdf' });            
       var fileURL = URL.createObjectURL(file);
       window.open(fileURL);

     }

  }else{
 this.spinner.hide()

  }
}


async viewCoApplicants(element,i){
  this.spinner.show();
  this.coApplicantFileURL=''
this.partyCoApplicantObj=element
  var obj = new Object();
  obj['b_acct_id'] = this.b_acct_id;
  obj['party_id'] = element['party_id']
  var resp = await this.applicationService.getCoApplicantDetail(obj);
  if (resp['error'] == false) {
    this.dataSource2 = new MatTableDataSource(resp.data);
    this.dataSource2.sort = this.sortCol3;
    this.dataSource2.paginator = this.paginator2;
    this.spinner.hide();
    $('.nav-tabs a[href="#tab-4"]').tab('show')

  } else {
    this.spinner.hide();

    this.snackBar.open("Error occured while getting Co-Applications", 'Error', {
      duration: 5000,
    });
  }


}


async viewCoApplicantFile(element,filename){
this.spinner.show()

var obj=new Object
obj['filename']=filename
obj['b_acct_id']=this.b_acct_id
obj['sub_scheme_code']=this.partyCoApplicantObj['sub_scheme_code']
obj['id']=element['id']
  const res = await this.applicationService.getUploadedFileofcoapplicant(obj);
  if (res) {
    // const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
    // this.fileURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
    this.spinner.hide();
    var docname = obj['filename'];
    var ext = docname.split('.');
    
     if(ext[1] == 'png' || ext[1] == 'jpeg' || ext[1] == 'jpg' || ext[1] == 'PNG' || ext[1] == 'JPEG' || ext[1] == 'JPG'){
       const unsafeImageUrl = window.URL.createObjectURL(res);
       this.coApplicantFileURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeImageUrl);
    

     }else{
    

       let file = new Blob([res], { type: 'application/pdf' });            
       var fileURL = URL.createObjectURL(file);
       window.open(fileURL);
     }
  }
}

}




