import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AllotmentService } from '../../service/allotment.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchemeService } from '../../service/scheme.service';
import { SubSchemeService } from '../../service/sub-scheme.service';
import { RegistryService } from '../../service/registry.service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ExcelService } from '../../service/file-export.service';
import { MainService } from '../../service/main.service'
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;


@Component({
  selector: 'app-allotment',
  templateUrl: './allotment.component.html',
  styleUrls: ['./allotment.component.css']
})
export class AllotmentComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private SchemeService: SchemeService, private registerService: RegistryService, private mainService: MainService, private excl: ExcelService, private SubSchemeService: SubSchemeService, private service: AllotmentService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }
  dataSource;
  displayedColumns = ['party_id', 'arr_effective_date', 'property_type_code', 'property_code', 'length', 'measurement_unit', 'property_no', 'quota_code', 'residential_or_commercial', 'scheme_code', 'width', 'sub_scheme_code', 'final_amount', 'status', 'action'];
  partyArr = [];
  partyObj = {};
  allBookletPurchase = [];
  bookletPurchaseObj = {};
  allotmentObj = {};
  allSchemes = [];
  b_acct_id;
  erpUser;
  selectedSchemeCode = "";
  user_id
  obj = {}
  propertyArr = []
  arrArr = []
  subschemeArr;
  subschemeArr1;
  subschemeObject = {}
  subselectedSchemeCode;
  schemeArr;
  schemeObject = {}
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    //await this.getAllSchemesforAllotment();
    await this.getAllSchemes();
  }
  async getAllSchemes() {
    this.spinner.show();

    var resp = await this.SchemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      for (let i = 0; i < this.schemeArr.length; i++) {
        this.schemeObject[this.schemeArr[i]['scheme_code']] = this.schemeArr[i]['scheme_name']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }

  async getSubSchemesAllforAllotment() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.obj['scheme_code'];
    this.obj['sub_scheme_code'] = ""
    var resp = await this.SubSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.subschemeArr1 = resp.data;
      this.spinner.hide();

    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllSubschemes() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.selectedSchemeCode;
    var resp = await this.SubSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.subschemeArr = resp.data;

      for (let i = 0; i < this.subschemeArr.length; i++) {
        this.subschemeObject[this.subschemeArr[i]['sub_scheme_code']] = this.subschemeArr[i]['sub_scheme_name']
      }
      this.spinner.hide();

    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async getAllAllotment() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.selectedSchemeCode;
    obj['sub_scheme_code'] = this.subselectedSchemeCode;
    var resp = await this.service.getAllAllotment(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allBookletPurchase = resp.data;
      this.dataSource = new MatTableDataSource(this.allBookletPurchase);
      this.dataSource.sort = this.sort;

      this.dataSource.paginator = this.paginator;
      this.spinner.hide();


    } else {
      this.spinner.hide();

      this.snackBar.open("Error occured while getting Allotments", 'Error', {
        duration: 5000,
      });
    }
  }
  async addAllotment() {
    this.allotmentObj['b_acct_id'] = this.b_acct_id;
    this.allotmentObj['create_user_id'] = this.user_id
    this.allotmentObj['txn_gateway_id'] = null;
    this.spinner.show();
    var resp = await this.service.createAllotment(this.allotmentObj);
    if (resp['error'] == false) {
      this.allotmentObj = {}
      await this.fetchDteaildFprAllotment()
      this.spinner.hide();
      this.snackBar.open("Added Successfully", 'Success', {
        duration: 5000,
      });
    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while Adding Allotment", 'Error', {
        duration: 5000,
      });
    }

  }
  async openUpdate(element, i) {
    this.allotmentObj = element;
    this.obj['scheme_code'] = element['scheme_code']
    this.obj['sub_scheme_code'] = element['sub_scheme_code']
    this.obj['b_acct_id'] = this.b_acct_id
    this.allotmentObj['old_property_id'] = this.allotmentObj['property_id']
    this.allotmentObj['property_id'] = this.allotmentObj['property_id']
    await this.fetchDteaildFprAllotment()
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  async updateAllotment() {
    this.allotmentObj['b_acct_id'] = this.b_acct_id;
    this.allotmentObj['update_user_id'] = this.user_id
    this.allotmentObj['arr_effective_date'] = this.allotmentObj['arr_effective_date'].split('T')[0];
    this.spinner.show();
    var resp = await this.service.updateAllotment(this.allotmentObj);
    if (resp['error'] == false) {
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.getAllAllotment()
      this.allotmentObj = {}
      this.obj = {}
      this.spinner.hide();
      this.snackBar.open("Updated Successfully", 'Success', {
        duration: 5000,
      });
    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while Updating Allotment", 'Error', {
        duration: 5000,
      });
    }
  }
  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

 setPropData=[]
  async fetchDteaildFprAllotment() {
    this.propertyArr = []
    this.arrArr = []
    var obj = Object.assign({}, this.obj)
    obj['b_acct_id'] = this.b_acct_id
    this.spinner.show()
    var resp = await this.service.getDataForAllotment(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.propertyArr = resp.data[0]
      this.arrArr = resp.data[1]
      this.setPropData=resp['data']

      this.spinner.hide();
      // this.snackBar.open("Added Successfully", 'Success', {
      //   duration: 5000,
      // });
    } else {

      this.spinner.hide();
      this.snackBar.open(" Some Error occured!", 'Error', {
        duration: 5000,
      });
    }
  }
  propertyArr2=[]
  setProperty(){
    this.propertyArr2=[]
    this.allotmentObj['property_id']=''
    let dum={}
    for(let i=0;i<this.arrArr.length;i++){
      if(this.allotmentObj['id']==this.arrArr[i]['id']){
        dum=Object.assign({},this.arrArr[i])
      }
    }
    if(dum['property_id']==null){
      this.propertyArr2=this.setPropData[0]
    }else{
      for(let i=0;i<this.setPropData[0].length;i++){
        if(dum['property_id']==this.setPropData[0][i]['property_id'])
        {
          this.propertyArr2.push(this.setPropData[0][i])
          this.allotmentObj['property_id']=this.propertyArr2[0]['property_id']
          break;
        }
      }
    }
  }

  async cancel(element, i) {
    this.allotmentObj = element;
    var obj = Object.assign({}, this.allotmentObj);
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.service.cancelAllotment(obj);
    this.spinner.show();

    if (resp['error'] == false) {
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.getAllAllotment()
      this.allotmentObj = {}
      this.obj = {}
      this.spinner.hide();
      this.snackBar.open("Cancelled Successfully", 'Success', {
        duration: 5000,
      });
    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while Updating Allotment", 'Error', {
        duration: 5000,
      });
    }
  }


  async approve(element, i) {

    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.user_id
    obj['arr_status_code'] = 'ALLOTTED'
    obj['id'] = element.id

    var resp = await this.service.approveAllotment(obj);
    this.spinner.show();
    if (resp['error'] == false) {
      this.getAllAllotment()

      this.spinner.hide();
      this.snackBar.open("Approved Successfully", 'Success', {
        duration: 5000,
      });
    } else {

      this.spinner.hide();
      this.snackBar.open("Error occured while Updating Allotment", 'Error', {
        duration: 5000,
      });
    }
  }
  export1() {
    var exp = []
    for (var i = 0; i < this.allBookletPurchase.length; i++) {
      var obj = new Object();
      obj['SNO'] = i + 1;
      obj['Applicant ID'] = this.allBookletPurchase[i]['party_id']
      obj['Effective Date'] = this.mainService.dateFormatChange(this.allBookletPurchase[i]['arr_effective_date'])
      obj['Subsidised/Non-Subsidised'] = this.allBookletPurchase[i]['subsidised_or_non_subsidised']
      obj['Property Type'] = this.allBookletPurchase[i]['property_type_code']
      obj['Length'] = this.allBookletPurchase[i]['length']
      obj['Width'] = this.allBookletPurchase[i]['width']
      obj['measurement unit'] = this.allBookletPurchase[i]['measurement_unit']
      obj['Property Number'] = this.allBookletPurchase[i]['property_no']
      obj['Quota'] = this.allBookletPurchase[i]['quota_code']
      obj['Residential/Commercial'] = this.allBookletPurchase[i]['residential_or_commercial']
      obj['Scheme Code'] = this.allBookletPurchase[i]['scheme_code']
      obj['Sub Scheme Code'] = this.allBookletPurchase[i]['sub_scheme_code']
      obj['Final Amount'] = this.allBookletPurchase[i]['final_amount']
      obj['Status'] = this.allBookletPurchase[i]['arr_status_code']
      exp.push(obj);
    }
    this.excl.exportAsExcelFile(exp, 'allotment')
  }
  // async getAllParties() {
  //   this.spinner.show()

  //   if (resp['error'] == false) {
  //     this.spinner.hide()
  //     // this.data = resp.data;


  //     // this.dataSource = new MatTableDataSource(this.data);
  //     // this.dataSource.sort = this.sort;

  //     // this.dataSource.paginator = this.paginator;
  //   } else {
  //     this.spinner.hide();
  //     this.snackBar.open("Error occured while getting Parties", 'Error', {
  //       duration: 5000,
  //     });
  //   }
  // }
  async print1() {
    this.spinner.show()
    let data = []
    // var obj = new Object();
    // obj['b_acct_id'] = this.b_acct_id;
    // var resp = await this.partyService.getPartydetail(JSON.stringify(obj));
    for (let i = 0; i < this.allBookletPurchase.length; i++) {
      let obj = {}
      if (this.allBookletPurchase[i]['party_id']) {
        obj['party_id'] = this.allBookletPurchase[i]['party_id']
      } else {
        obj['party_id'] = ''
      }
      // -------------------

      let obj2 = {}
      obj2['b_acct_id'] = this.b_acct_id

      obj2['party_id'] = obj['party_id']
      this.spinner.show()
      var resp = await this.registerService.getdetailsForregistry(obj2);
      if (resp['data']) {
        obj['party_name'] = resp['data'][0]['party_name']
        obj['party_phone_no'] = resp['data'][0]['party_phone_no']
      } else {
        obj['party_name'] = ''
        obj['party_phone_no'] = ''
      }
      // ---------------------
      if (this.allBookletPurchase[i]['arr_effective_date']) {
        obj['arr_effective_date'] = this.mainService.dateFormatChange(this.allBookletPurchase[i]['arr_effective_date'])
      } else {
        obj['arr_effective_date'] = ''
      }
      if (this.allBookletPurchase[i]['subsidised_or_non_subsidised']) {
        obj['subsidised_or_non_subsidised'] = this.allBookletPurchase[i]['subsidised_or_non_subsidised']
      } else {
        obj['subsidised_or_non_subsidised'] = ''
      }
      if (this.allBookletPurchase[i]['property_type_code']) {
        obj['property_type_code'] = this.allBookletPurchase[i]['property_type_code']
      } else {
        obj['property_type_code'] = ''
      }
      if (this.allBookletPurchase[i]['length']) {
        obj['length'] = this.allBookletPurchase[i]['length']
      } else {
        obj['length'] = ''
      }
      if (this.allBookletPurchase[i]['width']) {
        obj['width'] = this.allBookletPurchase[i]['width']
      } else {
        obj['width'] = ''
      }
      if (this.allBookletPurchase[i]['measurement_unit']) {
        obj['measurement_unit'] = this.allBookletPurchase[i]['measurement_unit']
      } else {
        obj['measurement_unit'] = ''
      }
      if (this.allBookletPurchase[i]['property_no']) {
        obj['property_no'] = this.allBookletPurchase[i]['property_no']
      } else {
        obj['property_no'] = ''
      }
      if (this.allBookletPurchase[i]['quota_code']) {
        obj['quota_code'] = this.allBookletPurchase[i]['quota_code']
      } else {
        obj['quota_code'] = ''
      }
      if (this.allBookletPurchase[i]['residential_or_commercial']) {
        obj['residential_or_commercial'] = this.allBookletPurchase[i]['residential_or_commercial']
      } else {
        obj['residential_or_commercial'] = ''
      }
      if (this.allBookletPurchase[i]['scheme_code']) {
        obj['scheme_code'] = this.allBookletPurchase[i]['scheme_code']
      } else {
        obj['scheme_code'] = ''
      }
      if (this.allBookletPurchase[i]['sub_scheme_code']) {
        obj['sub_scheme_code'] = this.allBookletPurchase[i]['sub_scheme_code']
      } else {
        obj['sub_scheme_code'] = ''
      }
      if (this.allBookletPurchase[i]['final_amount']) {
        obj['final_amount'] = this.allBookletPurchase[i]['final_amount']
      } else {
        obj['final_amount'] = ''
      }
      if (this.allBookletPurchase[i]['arr_status_code']) {
        obj['arr_status_code'] = this.allBookletPurchase[i]['arr_status_code']
      } else {
        obj['arr_status_code'] = ''
      }
      data.push(obj)
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
    }      // ------------
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
          text: 'Allotments',
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
    var tbl = {

      // layout: 'lightHorizontalLines',
      fontSize: 10,
      table: {

        headerRows: 1,
        widths: ['*', '*', '*', '*', '*', '*', '*', '*','*','*'],
        body: [
          ['Application ID', 'Applicant Name','Applicant Mobile','Property Number', 'Property Type', 'Length', 'Width', 'Subsidised/Non-Subsidised', 'Residential/Commercial', 'Final Amount']
        ],
      }
    };
    dd.content.push(tbl);
    for (var i = 0; i < data.length; i++) {
      var arr = []
      arr.push(data[i]['party_id']);
      arr.push(data[i]['party_name']);
      arr.push(data[i]['party_phone_no']);
      arr.push(data[i]['property_no']);
      arr.push(data[i]['property_type_code']);
      arr.push(data[i]['length']);
      arr.push(data[i]['width']);
      arr.push(data[i]['subsidised_or_non_subsidised']);
      arr.push(data[i]['residential_or_commercial']);
      arr.push(data[i]['final_amount']);
      dd.content[dd.content.length - 1].table.body.push(arr);
    }
    dd.content.push({ text: " " });
    dd.content.push(header9);
    this.spinner.hide()
    pdfMake.createPdf(dd).download("allotment");
  }
  async print(data) {
    let obj2 = {}
    obj2['b_acct_id'] = this.b_acct_id

    obj2['party_id'] = data['party_id']
    let obj={}
    this.spinner.show()
    var resp = await this.registerService.getdetailsForregistry(obj2);
    if (resp['data']) {
      obj['party_name'] = resp['data'][0]['party_name']
      obj['party_phone_no'] = resp['data'][0]['party_phone_no']
    } else {
      obj['party_name'] = ''
      obj['party_phone_no'] = ''
    }
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
          text: 'ALLOTMENT',
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
          text: 'Applicant ID :',
          bold: true
        },
        {
          width: '*',
          text: data['party_id']
        },
        {
          width: '*',
          text: 'Allotment Date :',
          bold: true
        },
        {
          width: '*',
          text: data['arr_effective_date']
        }

      ],
    }
    var header10 = {
      columns: [
        {
          width: '*',
          text: 'Applicant Name :',
          bold: true
        },
        {
          width: '*',
          text: obj['party_name']
        },
        {
          width: '*',
          text: 'Applicant Mobile Number :',
          bold: true
        },
        {
          width: '*',
          text: obj['party_phone_no']
        }

      ],
    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Subsidised/Non-Subsidised :',
          bold: true
        },
        {
          width: '*',
          text: data['subsidised_or_non_subsidised']


        },
        {
          width: '*',
          text: 'Property Type :',
          bold: true
        },

        {
          width: '*',
          text: data['property_type_code']
        }
      ],
    }
    var header3 = {
      columns: [

        {
          width: '*',
          text: 'Length  :',
          bold: true
        },
        {
          width: '*',
          text: data['length']
        },
        {
          width: '*',
          text: 'Width :',
          bold: true
        },
        {
          width: '*',
          text: data['width']
        }
      ],
    }
    var header4 = {
      columns: [

        {
          width: '*',
          text: 'Measurement Unit :',
          bold: true
        },
        {
          width: '*',
          text: data['measurement_unit']
        },
        {
          width: '*',
          text: 'Property Number :',
          bold: true
        },

        {
          width: '*',
          text: data['property_no']
        }
      ],
    }
    var header5 = {
      columns: [

        {
          width: '*',
          text: 'Catagory :',
          bold: true
        },
        {
          width: '*',
          text: data['quota_code']
        },
        {
          width: '*',
          text: 'Residential/Commercial :',
          bold: true
        },

        {
          width: '*',
          text: data['residential_or_commercial']
        }
      ],
    }
    var header6 = {
      columns: [

        {
          width: '*',
          text: 'Scheme :',
          bold: true
        },
        {
          width: '*',
          text: data['scheme_code']
        },
        {
          width: '*',
          text: 'Sub Scheme :',
          bold: true
        },

        {
          width: '*',
          text: data['sub_scheme_code']
        }
      ],
    }
    var header7 = {
      columns: [

        {
          width: '*',
          text: 'Final Amount  :',
          bold: true
        },
        {
          width: '*',
          text: data['final_amount']
        },
        {
          width: '*',
          text: 'Property Status :',
          bold: true
        },

        {
          width: '*',
          text: data['arr_status_code']
        }
      ],
    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header0);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header6);
    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push({ text: " " });
    dd.content.push(header10);
    dd.content.push({ text: " " });
    dd.content.push(header2);
    dd.content.push({ text: " " });
    dd.content.push(header3);
    dd.content.push({ text: " " });
    dd.content.push(header4);
    dd.content.push({ text: " " });
    dd.content.push(header5);
    dd.content.push({ text: " " });
    dd.content.push(header7);
    dd.content.push({ text: " " });
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.05 }] });
    dd.content.push({ text: " " });
    dd.content.push(header9);
    this.spinner.hide()
    pdfMake.createPdf(dd).download("allotment");
  }

}
