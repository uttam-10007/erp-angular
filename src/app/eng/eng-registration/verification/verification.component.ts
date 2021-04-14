import swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../../service/main.service';
import { VerificationService } from '../../service/verification.service';

import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { element } from 'protractor';
//import { FileUploader } from 'ng2-file-upload';
declare var $: any

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})

export class VerificationComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['s_no', 'name', 'status', 'application_category_code', 'action'];
  datasource;
  constructor(private verificationService: VerificationService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  allApp = []
  httpUrl;
  fileURL;
  erpUser;
  b_acct_id;
  doc_type = ''
  uploadDocArr = []
  uploadDocObj = {}
  categoryArr = []
  categoryObj = {}
  // obj={name:'Kunal Pvt. Ltd.',director_data:[{document_id:"1",din_no:1,name:'kunal',pan_no:'8485560',phone_no:'865555',adhar_no:'HSYGY6545'}],
  // project_data:[{client_name:"LDA",person_name:'MOHIT',amount:'6555145.00',document_id:'8485560',phone_no:'865555'},{client_name:"LDA",person_name:'MOHIT',amount:'6555145.00',document_id:'8485560',phone_no:'865555'}],avg_turnover:100.00,
  // manpower_data:[{name:"SVM",qualification_dtl:'12th',designation:'VC',experience:84}],machine_data:[{name:"JCB",year:2015,num_of_unit:5}],
  // turnover_data:[{fin_year:2020,profit_after_tax:1,working_capital:'DELHI',turnover:'8485560',profit_or_loss:'Profit'}]}
  obj = {}
  systemDate
  async ngOnInit() {

  
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };

    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    await this.getApplications()
    await this.getRefApplications()

  }
async add() {
  var obj = { document_id:null, din_no: '', name: '', phone_no: '', pan_no: '', adhar_no: '' }
  this.obj['director_data'].push(obj);
  
  }
  add1() {
    this.obj['turnover_data'].push({ fin_year: '', working_capital: '', profit_after_tax: '', turnover: 0, profit_or_loss: '' });
  }
  add2() {
    this.obj['project_data'].push({ client_name: '', person_name: '', amount: 0, phone_no: '', cost_in_word: '', document_id:null });
  }
  add3() {
    this.obj['manpower_data'].push({ name: '', qualification_dtl: '', designation: '', experience: '' });
  }
  add4() {
    this.obj['machine_data'].push({ name: '', year: '', num_of_unit: 0 });
  }
  delete2(i) {
    this.obj['director_data'].splice(i, 1);
  }
  delete5(i) {
    this.obj['turnover_data'].splice(i, 1);
  }
  delete1(i) {
    this.obj['project_data'].splice(i, 1);
  }
  delete3(i) {
    this.obj['manpower_data'].splice(i, 1);
  }
  delete4(i) {
    this.obj['machine_data'].splice(i, 1);
  }
  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  //httpUrl;
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
  index;
  openUploadTable(doc_type, i) {
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };


    $('#select').modal('show');
    this.doc_type = doc_type;
    this.index = i;
  }
  async upload() {
    this.spinner.show();
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();

    obj['b_acct_id'] = this.b_acct_id;
    obj['document_name'] = this.uploader.queue[0].some.name;
    obj['document_type_code'] = this.doc_type;
    obj['create_user_id'] = 0;
    obj['application_id'] = this.obj['id'];
    this.spinner.show()
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/eng/upload/uploadDocument' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      var resp = JSON.parse(response);

      if (resp.error == false) {
        if (this.doc_type == 'INCORP') {
          this.obj['incorp_cert_document_id'] = resp.data;

        } else if (this.doc_type == 'PAN') {
          this.obj['pan_document_id'] = resp.data;

        } else if (this.doc_type == 'COMPLETION_CERTIFICATE') {
          this.obj['project_data'][this.index]['document_id'] = resp.data;

        } else if (this.doc_type == 'PHOTO') {
          this.obj['director_data'][this.index]['document_id'] = Number(resp.data);
         
        }
        else if (this.doc_type == 'FIRM') {
          this.obj['firm_document_id'] = resp.data;

        }
      
        else if (this.doc_type == 'BOARD') {
          this.obj['board_document_id'] = resp.data;

        }
        else if (this.doc_type == 'NET_WORTH') {
          this.obj['net_worth_document_id'] = resp.data;

        }
        else if (this.doc_type == 'ITR') {
          this.obj['itr_document_id'] = resp.data;

        }
        else if (this.doc_type == 'BALANCE_SHEET') {
          this.obj['balance_sheet_document_id'] = resp.data;

        }
        await this.getuploaddocument()
        this.spinner.hide();
        swal.fire('Success', 'File Uploaded Successfully!!','success');
      } else {
        this.spinner.hide()
        swal.fire('Error', resp.data,'error');
      }
    };

  }
  async getRefApplications() {
    let obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.verificationService.getRefApplications(JSON.stringify(obj));
    if (resp['error'] == false) {

      this.categoryArr = resp['data']
      this.categoryObj = new Object;
      for (let i = 0; i < this.categoryArr.length; i++) {
        this.categoryObj[this.categoryArr[i]['application_category_code']] = this.categoryArr[i]
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All category !','error');
    }
  }
  async getApplications() {
    this.spinner.show()
    let obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.verificationService.getApplications(JSON.stringify(obj));
    if (resp['error'] == false) {

      this.allApp = resp['data']
      this.datasource = new MatTableDataSource(this.allApp);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Applications !','error');
    }


  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  email
  async getuploaddocument(){
    let ob = new Object;
    ob['b_acct_id'] = this.b_acct_id
    ob["application_id"] = this.obj['id']
    var resp = await this.verificationService.getUploadedDocuments(JSON.stringify(ob));
    if (resp['error'] == false) {

      this.uploadDocArr = resp['data']
      this.uploadDocObj = new Object;
      for (let i = 0; i < this.uploadDocArr.length; i++) {
        this.uploadDocObj[this.uploadDocArr[i]['id']] = this.uploadDocArr[i]['document_name']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting Upload Documents!','error');
    }

  }
  async open_update(element) {

    this.obj = Object.assign({}, element)
    this.obj['director_data'] = JSON.parse(element['director_data'])
    this.obj['project_data'] = JSON.parse(element['project_data'])

    this.obj['manpower_data'] = JSON.parse(element['manpower_data'])
    this.obj['machine_data'] = JSON.parse(element['machine_data'])
    this.obj['turnover_data'] = JSON.parse(element['turnover_data'])
    this.obj['estab_year'] = String(element.estab_year)
this.email = this.ValidateEmail(this.obj['pri_email_id'])
    let ob = new Object;
    ob['b_acct_id'] = this.b_acct_id
    ob["application_id"] = element.id
    var resp = await this.verificationService.getUploadedDocuments(JSON.stringify(ob));
    if (resp['error'] == false) {

      this.uploadDocArr = resp['data']
      this.uploadDocObj = new Object;
      for (let i = 0; i < this.uploadDocArr.length; i++) {
        this.uploadDocObj[this.uploadDocArr[i]['id']] = this.uploadDocArr[i]['document_name']
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting Upload Documents!','error');
    }

    $('.nav-tabs a[href="#tab-7-2"]').tab('show')
  }
  async delete(element) {
    this.spinner.show()
    let obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = element.id

    var resp = await this.verificationService.deleteApplication(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getApplications()
      //await this.changeStatus()
      swal.fire('Success', 'Deleted Successfully!','success');


      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Deleting Application !','error');
    }

  }
  async update() {
    this.spinner.show()
    let ob = new Object;
    ob = this.obj
    ob['b_acct_id'] = this.b_acct_id

    ob['update_user_id'] = this.erpUser.user_id
    ob['director_data'] = JSON.stringify(this.obj['director_data'])
    ob['project_data'] = JSON.stringify(this.obj['project_data'])
    ob['manpower_data'] = JSON.stringify(this.obj['manpower_data'])
    ob['machine_data'] = JSON.stringify(this.obj['machine_data'])
    ob['turnover_data'] = JSON.stringify(this.obj['turnover_data'])
    var resp = await this.verificationService.updateApplication(ob);
    if (resp['error'] == false) {

      await this.getApplications()
      this.spinner.hide();
      swal.fire('Success', 'Updated Successfully!','success');

    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Applications !','error');
    }

  }
  ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return (true)
    } else {
      
      return (false)
    }


  }
  async accept() {
    this.spinner.show()
    let ob = new Object;
    ob = Object.assign({}, this.obj)
    ob['status'] = 'ACTIVE'
    ob['update_user_id'] = this.erpUser.user_id
    ob['b_acct_id'] = this.b_acct_id
    ob['category_obj'] = this.categoryObj[this.obj['application_category_code']]
    ob['director_data'] = JSON.stringify(this.obj['director_data'])
    ob['project_data'] = JSON.stringify(this.obj['project_data'])
    ob['manpower_data'] = JSON.stringify(this.obj['manpower_data'])
    ob['machine_data'] = JSON.stringify(this.obj['machine_data'])
    ob['turnover_data'] = JSON.stringify(this.obj['turnover_data'])
    var resp = await this.verificationService.updateApplication(ob);
    if (resp['error'] == false) {

      await this.getApplications()
      this.spinner.hide();
      swal.fire('Success', 'Accepted Successfully!','success');
      $('.nav-tabs a[href="#tab-7-1"]').tab('show')


    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Applications !','error');
    }

  }
  async cancel(element) {
    this.spinner.show()
    let ob = new Object;
    ob = Object.assign({}, element)
    ob['status'] = 'CANCELLED'
    ob['update_user_id'] = this.erpUser.user_id
    ob['b_acct_id'] = this.b_acct_id
    var resp = await this.verificationService.updateApplication(ob);
    if (resp['error'] == false) {

      await this.getApplications()
      this.spinner.hide();
      swal.fire('Success', 'Cancelled Successfully!','success');


    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Applications !','error');
    }

  }
  async reject() {
    this.spinner.show()
    let ob = new Object;
    ob = this.obj
    ob['update_user_id'] = this.erpUser.user_id
    ob['b_acct_id'] = this.b_acct_id

    ob['status'] = 'REJECTED'
    ob['director_data'] = JSON.stringify(this.obj['director_data'])
    ob['project_data'] = JSON.stringify(this.obj['project_data'])
    ob['manpower_data'] = JSON.stringify(this.obj['manpower_data'])
    ob['machine_data'] = JSON.stringify(this.obj['machine_data'])
    ob['turnover_data'] = JSON.stringify(this.obj['turnover_data'])
    var resp = await this.verificationService.updateApplication(ob);
    if (resp['error'] == false) {
      await this.getApplications()
      this.spinner.hide();
      swal.fire('Success', 'Rejected Successfully!','success');
      $('.nav-tabs a[href="#tab-7-1"]').tab('show')


    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Applications !','error');
    }

  }
  async view(file_id) {
    var obj = new Object
    obj['id'] = file_id
    obj['b_acct_id'] = this.b_acct_id
    obj["application_id"] = this.obj['id']
    obj["document_name"] = this.uploadDocObj[file_id]
    this.spinner.show()
if(obj["document_name"] != undefined){
    const res = await this.verificationService.downloadDocument(obj);
    if (res) {
      // const unsafeImageUrl = window.URL.createObjectURL(res); // URL.createObjectURL(res);
      // this.fileURL = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
      var docname = obj["document_name"];
      var ext = docname.split('.');

      if (ext[1] == 'png' || ext[1] == 'jpeg' || ext[1] == 'jpg' || ext[1] == 'PNG' || ext[1] == 'JPEG' || ext[1] == 'JPG') {
        // const unsafeImageUrl = window.URL.createObjectURL(res);
        // this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeImageUrl);
        // window.open(this.fileURL );
        let file = new Blob([res], { type: 'image/png' });
        var fileURL = URL.createObjectURL(file);
        this.spinner.hide()

        window.open(fileURL, '_blank');
       
      } else {
        let file = new Blob([res], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(file);
        

        window.open(fileURL);
        this.spinner.hide()
      }

    } else {
      this.spinner.hide()

    }
  }
  else{
    this.spinner.hide()
    swal.fire('Error', 'No document Uploaded !','error');
  
  }
  }
  refresh() {
    this.obj = new Object
  }
  Close() {
    $('#select').modal('hide');
  }
}
