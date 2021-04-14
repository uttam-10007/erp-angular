import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { ChartOfAccountService } from '../../service/chart-of-account.service';
import { MainService } from '../../service/main.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
declare var $: any;
import { FileUploader } from 'ng2-file-upload';
import swal from 'sweetalert2';


@Component({
  selector: 'app-char-of-account',
  templateUrl: './char-of-account.component.html',
  styleUrls: ['./char-of-account.component.css']
})
export class CharOfAccountComponent implements OnInit {

  constructor(public mainService: MainService, private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private ChartOfAccountService: ChartOfAccountService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'lvl1_code', 'lvl1_value', 'lvl2_code', 'lvl2_value', 'lvl3_code', 'lvl3_value', 'lvl4_code', 'lvl4_value', 'lvl5_code', 'lvl5_value', 'lvl6_code', 'lvl6_value', 'lvl7_code', 'lvl7_value', 'leaf_code', 'leaf_value', 'action'];
  datasource;
  erpUser

  obj = {};
  b_acct_id
  allChartOfAccount = [];
  level1 = [];
  level2 = []
  level3 = []
  level4 = []
  level5 = []
  level6 = []
  level7 = []

  BALACESHEET = [{ lvl2_value: 'ASSET', lvl2_code: '100011' }, { lvl2_value: 'LIABILITY', lvl2_code: '100012' }, { lvl2_value: 'EQUITY', lvl2_code: '100013' }];
  INCOME_STATEMENT = [{ lvl2_value: 'INCOME', lvl2_code: '100021' }, { lvl2_value: 'EXPENSE', lvl2_code: '100022' }];

  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.getAllChartOfAccount();
  }

  async onChangeLvl1() {
    for (let i = 0; i < this.level1.length; i++) {
      if (this.level1[i]['lvl1_code'] == this.obj['lvl1_code']) {
        this.obj['lvl1_value'] = this.level1[i]['lvl1_value']
      }
    }
    let temp = []
    this.level2 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (this.allChartOfAccount[i]['lvl1_code'] == this.obj['lvl1_code']) {
        if (!temp.includes(this.allChartOfAccount[i]['lvl2_code'])) {
          temp.push(this.allChartOfAccount[i]['lvl2_code'])
          let ob = new Object()
          ob['lvl2_code'] = this.allChartOfAccount[i]['lvl2_code']
          ob['lvl2_value'] = this.allChartOfAccount[i]['lvl2_value']
          this.level2.push(ob)
        }
      }

    }
    this.level3 = []
    this.level4 = []
    this.level5 = []
    this.level6 = []
    this.level7 = []

    for (let i = 2; i < 8; i++) {
      this.obj['lvl' + i + '_code'] = null
      this.obj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }

  async  onChangeLvl2() {
    for (let i = 0; i < this.level2.length; i++) {
      if (this.level2[i]['lvl2_code'] == this.obj['lvl2_code']) {
        this.obj['lvl2_value'] = this.level2[i]['lvl2_value']
      }
    }
    let temp = []
    this.level3 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (this.allChartOfAccount[i]['lvl2_code'] == this.obj['lvl2_code']) {
        if (!temp.includes(this.allChartOfAccount[i]['lvl3_code'])) {
          temp.push(this.allChartOfAccount[i]['lvl3_code'])
          let ob = new Object()
          ob['lvl3_code'] = this.allChartOfAccount[i]['lvl3_code']
          ob['lvl3_value'] = this.allChartOfAccount[i]['lvl3_value']
          this.level3.push(ob)
        }
      }

    }
    this.level4 = []
    this.level5 = []
    this.level6 = []
    this.level7 = []

    for (let i = 3; i < 8; i++) {
      this.obj['lvl' + i + '_code'] = null
      this.obj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }


  async  onChangeLvl3() {
    for (let i = 0; i < this.level3.length; i++) {
      if (this.level3[i]['lvl3_code'] == this.obj['lvl3_code']) {
        this.obj['lvl3_value'] = this.level3[i]['lvl3_value']
      }
    }
    let temp = []
    this.level4 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (this.allChartOfAccount[i]['lvl3_code'] == this.obj['lvl3_code']) {
        if (!temp.includes(this.allChartOfAccount[i]['lvl4_code'])) {
          temp.push(this.allChartOfAccount[i]['lvl4_code'])
          let ob = new Object()
          ob['lvl4_code'] = this.allChartOfAccount[i]['lvl4_code']
          ob['lvl4_value'] = this.allChartOfAccount[i]['lvl4_value']
          this.level4.push(ob)
        }
      }

    }
    this.level5 = []
    this.level6 = []
    this.level7 = []

    for (let i = 4; i < 8; i++) {
      this.obj['lvl' + i + '_code'] = null
      this.obj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }

  async   onChangeLvl4() {
    for (let i = 0; i < this.level4.length; i++) {
      if (this.level4[i]['lvl4_code'] == this.obj['lvl4_code']) {
        this.obj['lvl4_value'] = this.level4[i]['lvl4_value']
      }
    }
    let temp = []
    this.level5 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (this.allChartOfAccount[i]['lvl4_code'] == this.obj['lvl4_code']) {
        if (!temp.includes(this.allChartOfAccount[i]['lvl5_code'])) {
          temp.push(this.allChartOfAccount[i]['lvl5_code'])
          let ob = new Object()
          ob['lvl5_code'] = this.allChartOfAccount[i]['lvl5_code']
          ob['lvl5_value'] = this.allChartOfAccount[i]['lvl5_value']
          this.level5.push(ob)
        }
      }

    }
    this.level6 = []
    this.level7 = []

    for (let i = 5; i < 8; i++) {
      this.obj['lvl' + i + '_code'] = null
      this.obj['lvl' + i + '_value'] = null

    }

    await this.makingLeafValues()


  }

  async   onChangeLvl5() {
    for (let i = 0; i < this.level5.length; i++) {
      if (this.level5[i]['lvl5_code'] == this.obj['lvl5_code']) {
        this.obj['lvl5_value'] = this.level5[i]['lvl5_value']
      }
    }
    let temp = []
    this.level6 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (this.allChartOfAccount[i]['lvl5_code'] == this.obj['lvl5_code']) {
        if (!temp.includes(this.allChartOfAccount[i]['lvl6_code'])) {
          temp.push(this.allChartOfAccount[i]['lvl6_code'])
          let ob = new Object()
          ob['lvl6_code'] = this.allChartOfAccount[i]['lvl6_code']
          ob['lvl6_value'] = this.allChartOfAccount[i]['lvl6_value']
          this.level6.push(ob)
        }
      }

    }
    this.level7 = []

    for (let i = 6; i < 8; i++) {
      this.obj['lvl' + i + '_code'] = null
      this.obj['lvl' + i + '_value'] = null

    }


    await this.makingLeafValues()

  }


  async  onChangeLvl6() {
    for (let i = 0; i < this.level6.length; i++) {
      if (this.level6[i]['lvl6_code'] == this.obj['lvl6_code']) {
        this.obj['lvl6_value'] = this.level6[i]['lvl6_value']
      }
    }
    let temp = []
    this.level7 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (this.allChartOfAccount[i]['lvl6_code'] == this.obj['lvl6_code']) {
        if (!temp.includes(this.allChartOfAccount[i]['lvl7_code'])) {
          temp.push(this.allChartOfAccount[i]['lvl7_code'])
          let ob = new Object()
          ob['lvl7_code'] = this.allChartOfAccount[i]['lvl7_code']
          ob['lvl7_value'] = this.allChartOfAccount[i]['lvl7_value']
          this.level7.push(ob)
        }
      }

    }

    for (let i = 7; i < 8; i++) {
      this.obj['lvl' + i + '_code'] = null
      this.obj['lvl' + i + '_value'] = null

    }
await this.makingLeafValues()


  }


  
  async  onChangeLvl7(){
    for(let i=0;i<this.level7.length;i++){
      if(this.level7[i]['lvl7_code']==this.obj['lvl7_code']){
        this.obj['lvl7_value']=this.level7[i]['lvl7_value']
      }
    }
  
    await this.makingLeafValues()



  }
  async getAllChartOfAccount() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ChartOfAccountService.getchartofaccount(obj);
    if (resp['error'] == false) {
      this.allChartOfAccount = resp.data;
      this.datasource = new MatTableDataSource(this.allChartOfAccount)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }
  async open_update(element) {
    this.spinner.show()
    this.refresh()
    this.obj = Object.assign({}, element);
    await this.onChangeLvl1();
    this.obj = Object.assign({}, element);

    await this.onChangeLvl2();
    this.obj = Object.assign({}, element);

    await this.onChangeLvl3();
    this.obj = Object.assign({}, element);

    await this.onChangeLvl4();
    this.obj = Object.assign({}, element);

    await this.onChangeLvl5();
    this.obj = Object.assign({}, element);

    await this.onChangeLvl6();
    this.obj = Object.assign({}, element);

    this.spinner.hide()
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
 async  addNew(i) {
    if (this.obj['lvl' + i + '_type'] == 'text') {
      this.obj['lvl' + i + '_type'] = ''

    } else {
      this.obj['lvl' + i + '_type'] = 'text'

    }
    this.obj['lvl' + i + '_code'] = null
    this.obj['lvl' + i + '_value'] = null
    for (let j = i; j < 8; j++) {
      if (this.obj['lvl' + j + '_type'] != 'text') {
        this.obj['lvl' + j + '_code'] = null
        this.obj['lvl' + j + '_value'] = null
      }

    }
    await this.makingLeafValues()

  }
  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;


    var resp = await this.ChartOfAccountService.createchartofaccount(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllChartOfAccount();
      this.snackBar.open("Add Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
    }
  }
  async update() {
    this.spinner.show();

    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ChartOfAccountService.updatechartofaccount(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllChartOfAccount();

      this.snackBar.open("Update Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  refresh() {
    let temp = []
    this.level1 = []
    for (let i = 0; i < this.allChartOfAccount.length; i++) {
      if (!temp.includes(this.allChartOfAccount[i]['lvl1_code'])) {
        temp.push(this.allChartOfAccount[i]['lvl1_code'])
        let ob = new Object()
        ob['lvl1_code'] = this.allChartOfAccount[i]['lvl1_code']
        ob['lvl1_value'] = this.allChartOfAccount[i]['lvl1_value']
        this.level1.push(ob)
      }
    }
    this.obj = {};
    this.level2 = []

    this.level3 = []
    this.level4 = []
    this.level5 = []
    this.level6 = []
    this.level7 = []

  }


  async delete(element) {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;
    this.spinner.show()

    var resp = await this.ChartOfAccountService.deletechartofaccount(obj);
    if (resp['error'] == false) {
      await this.getAllChartOfAccount()
      this.spinner.hide();

      this.snackBar.open("Delete Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
    }
  }

  ////////////////upload code


  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;

  onFileUpload(event, files) {
    this.selectedFile = <File>event.target.files[0];

    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
    };

  }


  is_header_present = false;
  exportTemplate(){
    var arr1=[["","","","","Instruction to Fill The data in Sheet 2","","","",""],
    ["1","Please use only Numbers and character and sign to fill the data","","","","","","",""],
    ["2","All Value are alpha neumeric","","","","","","",""],
    ["3","Duplicate value will be removed while processing the file","","","","","","",""]];
    var arr2=[["lvl1_code",	"lvl1_value",	"lvl2_code",	"lvl2_value",	"lvl3_code",	"lvl3_value",	"lvl4_code"	,"lvl4_value",	"lvl5_code",	"lvl5value"	,"lvl6_code",	"lvl6_value",	"lvl7_code",	"lvl7_value",	"leaf_code",	"leaf_value"]]
    this.mainService.exportAsExcelFile(arr1,arr2,"ChartOfAccount-Template")
  }
  async upload() {
    this.spinner.show();
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['file_name'] = this.uploader.queue[0].some.name;
    var extention = obj['file_name'].split(".")
    obj['create_user_id'] = this.erpUser.user_id;
    obj['is_header_present'] = 1;
    this.spinner.show()
    if(extention[1].toLowerCase() == 'xlsx'){
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/accounts/chartofaccount/processCOAFile' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      var resp = JSON.parse(response)
      if (resp.error == false) {
        await this.getAllChartOfAccount();
        this.spinner.hide();
        swal.fire('Success', 'File Uploaded Successfully!!','success');
      } else {
        this.spinner.hide()
        swal.fire('Error', resp.data,'error');
      }
    };
  }
  else{
    this.spinner.hide();
    swal.fire('Error', 'Please Upload Our Template File !!','error');
  }
  }



  async makingLeafValues(){

    if(this.obj['lvl7_code']!=undefined && this.obj['lvl7_code']!='' && this.obj['lvl7_code']!=null ){
    this.obj['leaf_code']=this.obj['lvl7_code']
    this.obj['leaf_value']=this.obj['lvl7_value']
    }else if (this.obj['lvl6_code']!=undefined && this.obj['lvl6_code']!='' && this.obj['lvl6_code']!=null){
    this.obj['leaf_code']=this.obj['lvl6_code']
    this.obj['leaf_value']=this.obj['lvl6_value']
    }else if (this.obj['lvl5_code']!=undefined && this.obj['lvl5_code']!='' && this.obj['lvl5_code']!=null){
    this.obj['leaf_code']=this.obj['lvl5_code']
    this.obj['leaf_value']=this.obj['lvl5_value']
    }else if (this.obj['lvl4_code']!=undefined && this.obj['lvl4_code']!='' && this.obj['lvl4_code']!=null){
    this.obj['leaf_code']=this.obj['lvl4_code']
    this.obj['leaf_value']=this.obj['lvl4_value']
    }else if (this.obj['lvl3_code']!=undefined && this.obj['lvl3_code']!='' && this.obj['lvl3_code']!=null){
    this.obj['leaf_code']=this.obj['lvl3_code']
    this.obj['leaf_value']=this.obj['lvl3_value']
    }else if (this.obj['lvl2_code']!=undefined && this.obj['lvl2_code']!='' && this.obj['lvl2_code']!=null){
    this.obj['leaf_code']=this.obj['lvl2_code']
    this.obj['leaf_value']=this.obj['lvl2_value']
    }else if (this.obj['lvl1_code']!=undefined && this.obj['lvl1_code']!='' && this.obj['lvl1_code']!=null){
    this.obj['leaf_code']=this.obj['lvl1_code']
    this.obj['leaf_value']=this.obj['lvl1_value']
    }
    
    
  }
}
