import swal from 'sweetalert2';
import { Component, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../../_services/script-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MainService } from '../../service/main.service';
import { TenderService } from '../../service/tender.service';
import { BaseItemService } from '../../service/base-item.service';
import { FileUploader } from 'ng2-file-upload';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import { element } from 'protractor';
import { HierarchyService } from '../../../accounts/service/hierarchy.service';
import { EstimateService } from '../../service/estimate.service';
import { SettingService } from '../../service/setting.service';
import { VerificationService } from '../../service/verification.service';
declare var $: any

@Component({
  selector: 'app-imported-tender',
  templateUrl: './imported-tender.component.html',
  styleUrls: ['./imported-tender.component.css']
})
export class ImportedTenderComponent implements OnInit {
  constructor(private verificationService: VerificationService, private settingService: SettingService, private EstimateService: EstimateService, private baseItemService: BaseItemService, private hierarchyService: HierarchyService, private TenderService: TenderService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  Obj = {};
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'name_of_tender', 'nic_tender_id', 'no_of_applicants', 'nic_tender_sale_end_date', 'result_status',
    'tender_ref_no', 'action'];
  datasource;
  allBaseItem = [];
  allEstimate = [];
  uploadtenderobj = { dataArr: [] }
  httpUrl;
  uploadDocObj = {}
  uploadDocArr = []
  fileURL;
  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  //httpUrl;
  uploader;
  select;
  tenderstatus;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAlltender()
    await this.getAllEstimate()
    await this.getAllimportedtender()
  }
  changecover() {

  }
  async open_update(element) {
    var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    obj['svayam_tender_id'] = element['svayam_tender_id']
    obj['payment_status'] = 'SUCCESS'
    var resp = await this.TenderService.getTenderApplications(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tenderapplication = resp.data;
      for (let i = 0; i < this.tenderapplication.length; i++) {
        if (this.tenderapplication[i]['tender_fill_status'] == 'FILLED') {
          var obj = Object()
          obj['id'] = this.tenderapplication[i]['id']
          obj['tender_fill_status'] = this.tenderapplication[i]['tender_fill_status']
          obj['evaluation_allowed_dataarr'] = JSON.parse(this.tenderapplication[i]['technical_document_data'])
          obj['financial_document_id'] = this.tenderapplication[i]['financial_document_id']
          obj['id'] = this.tenderapplication[i]['id']
          this.uploadtenderobj['dataArr'].push(obj)
        }
      }


      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error While getting All Expoted Tender Applications !','error');
    }
    this.Obj = Object.assign({}, element);
    for (let i = 0; i < this.tender.length; i++) {
      if (element['svayam_tender_id'] == this.tender[i]['svayam_tender_id']) {
        this.Obj['est_id'] = this.tender[i]['est_id']
      }

    }
    await this.changeestimate()
    this.Obj['nic_tender_id'] = element['nic_tender_id']
    this.Obj['nic_tender_sale_end_date'] = element['nic_tender_sale_end_date']
    this.Obj['tender_ref_no'] = element['tender_ref_no']
    this.Obj['no_of_applicants'] = element['no_of_applicants']
    this.Obj['result_status'] = element['result_status']
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
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
  openUpload(doc_type) {
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    $('#select').modal('show');

    this.doc_type = doc_type;
  }

  index;
  openUploadTable(doc_type, i) {
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };


    $('#select').modal('show');
    this.doc_type = doc_type;
    this.index = i;
  }
  doc_type = ''
  async upload() {
    this.spinner.show();
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();

    obj['b_acct_id'] = this.b_acct_id;
    obj['document_name'] = this.uploader.queue[0].some.name;
    obj['document_type_code'] = this.doc_type;
    obj['create_user_id'] = this.erpUser.user_id;
    obj['application_id'] = 0  //'1-TENDER' //this.Obj['id'] +'-TENDER';
    this.spinner.show()
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/eng/upload/uploadDocument' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      var resp = JSON.parse(response);
      if (resp.error == false) {
        if (this.doc_type == 'BOQ') {
          this.Obj['boq_document_id'] = resp.data;

        } else if (this.doc_type == 'TENDER BOQ') {
          this.uploadtenderobj['dataArr'][this.index]['financial_document_id'] = resp.data;

        } else if (this.doc_type == 'TENDER DOC') {
          this.uploadtenderobj['dataArr'][this.indexmodal]['evaluation_allowed_dataarr'][this.index]['document_id'] = resp.data;
        }


        this.spinner.hide();
        swal.fire('Success', 'File Uploaded Successfully!!','success');
      } else {
        this.spinner.hide()
        swal.fire('Error', resp.data,'error');
      }
    };

  }
  Close() {
    $('#select').modal('hide');
  }
  async getAllEstimate() {
    this.spinner.show()
    var resp = await this.EstimateService.getestimate(this.b_acct_id);
    if (resp['error'] == false) {
      this.allEstimate = resp.data;

      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Estimate !','error');
    }
  }

  refresh() {

    this.Obj = {};
    this.uploadtenderobj['dataArr'] = []
  }
  tenderapplication = []
  dataarray = []

  async changeestimate() {
    this.dataarray = []
    var flag = false;
    for (let i = 0; i < this.tender.length; i++) {
      if (this.Obj['svayam_tender_id'] == this.tender[i]['svayam_tender_id']) {        
        flag = true;
        var obj = Object()
        obj['b_acct_id'] = this.b_acct_id
        obj['svayam_tender_id'] = this.tender[i]['svayam_tender_id']
        obj['payment_status'] = 'SUCCESS'
        var resp = await this.TenderService.getTenderApplications(JSON.stringify(obj));
        if (resp['error'] == false) {
          this.tenderapplication = resp.data;
          this.spinner.hide();
        } else {
          this.spinner.hide();
          swal.fire('Error', 'Error while getting All Expoted Tender Applications !','error');
        }
        this.Obj = Object.assign({}, this.tender[i]);
        this.Obj['no_of_applicants'] = Number(resp.data.length)
        this.Obj['num_of_cover'] = String(this.Obj['num_of_cover'])
        if (this.tender[i]['corr_data'] != null) {
          this.Obj['dataArr'] = JSON.parse(this.tender[i]['corr_data']);
        } else {
          this.Obj['corr_data'] = []
        }
        if (this.tender[i]['cover_data'] != null) {
          this.Obj['cover_dataarr'] = JSON.parse(this.tender[i]['cover_data']);
        } else {
          this.Obj['cover_data'] = []
        }
        if (this.tender[i]['tender_doc_data'] != null) {
          this.Obj['tender_doc_dataarr'] = JSON.parse(this.tender[i]['tender_doc_data']);
        } else {
          this.Obj['tender_doc_data'] = []
        }
        if (this.tender[i]['evaluation_allowed_data'] != null) {
          this.Obj['evaluation_allowed_dataarr'] = JSON.parse(this.tender[i]['evaluation_allowed_data']);
          this.dataarray = JSON.parse(this.tender[i]['evaluation_allowed_data']);
        } else {
          this.Obj['evaluation_allowed_dataarr'] = []
        }
        if (this.tender[i]['payment_instrument_data'] != null) {
          this.Obj['payment_instrument_dataarr'] = JSON.parse(this.tender[i]['payment_instrument_data']);
        } else {
          this.Obj['payment_instrument_dataarr'] = []
        }
      }

    }
    if (flag == false) {
      this.Obj = {}
    }
  }
  tender_id = []
  async changeTender() {
this.tender_id=[]
    for (let i = 0; i < this.tender.length; i++) {
      if (this.tender[i]['est_id'] == this.Obj['est_id']) {
        var obj= Object.assign({},this.tender[i])
        this.tender_id.push(obj)
      }
    }
  }


  tender = []
  tender_name = {}
  async getAlltender() {
    this.spinner.show()
    var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    /* obj['tender'] = 'EXPORTED' */
    var resp = await this.TenderService.gettenders(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tender = resp.data;
      for (let i = 0; i < this.tender.length; i++) {
        this.tender_name[this.tender[i]['svayam_tender_id']] = this.tender[i]['tender_name']

      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Expoted Tender !','error');
    }
  }
  importedtender = []
  async getAllimportedtender() {
    this.spinner.show()
    var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    obj['tender'] = 'IMPORTED'
    var resp = await this.TenderService.getimportedTenderss(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.importedtender = resp.data;
      this.datasource = new MatTableDataSource(this.importedtender);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All tender !','error');
    }
  }

  async submit() {
    this.spinner.show()
    var data = []
    for (let i = 0; i < this.uploadtenderobj['dataArr'].length; i++) {
      var obj = Object.assign({}, this.uploadtenderobj['dataArr'][i])
      obj['technical_document_data'] = JSON.stringify(obj['evaluation_allowed_dataarr'])
      data.push(obj)
    }
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    this.Obj['data'] = data
    this.Obj['result_status'] = 'UNALLOTED'
    var resp = await this.TenderService.createimportedTender(this.Obj);
    if (resp['error'] == false) {

      await this.getAllimportedtender();
      this.spinner.hide();
      swal.fire('Success', 'Tender Imported Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while adding  Tender!','error');
    }
  }
  async update() {
this.spinner.show()
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var data = []
    for (let i = 0; i < this.uploadtenderobj['dataArr'].length; i++) {
      var obj = Object.assign({}, this.uploadtenderobj['dataArr'][i])
      obj['technical_document_data'] = JSON.stringify(obj['evaluation_allowed_dataarr'])
      data.push(obj)
    }
    this.Obj['data'] = data
    /*  var data = JSON.stringify(this.Obj['dataArr']);
     this.Obj['data'] = data; */
    var resp = await this.TenderService.updateimportedTenders(this.Obj);
    if (resp['error'] == false) {
      await this.getAllimportedtender();
      this.spinner.hide();

      swal.fire('Success', 'Tender IMPORTED Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while updating  Tender!','error');
    }
  }
  async delete(element) {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element['id'];
    var doc_id = []
    doc_id.push(element['tender_document_id'])
    doc_id.push(element['boq_document_id'])
    var data = JSON.parse(element['data'])
    for (let i = 0; i < data.length; i++) {
      doc_id.push(data[i]['document_id'])

    }
    obj['doc_id'] = doc_id
    var resp = await this.TenderService.deletetender(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAllimportedtender();

      this.spinner.hide();
      swal.fire('Success', 'Tender Deleted Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Deleting  Tender !','error');
    }
  }
  async getuploaddocument(file_id) {
    this.spinner.show()
    let ob = new Object;
    ob['b_acct_id'] = this.b_acct_id
    ob["id"] = file_id  //'1-TENDER'// this.Obj['id']
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
  async view(file_id) {
    await this.getuploaddocument(file_id)
    var obj = new Object
    obj['id'] = file_id
    
    obj['b_acct_id'] = this.b_acct_id
    obj["application_id"] =0  //'1-TENDER' //this.Obj['id']
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
       
      } else if(ext[1].toLowerCase() == 'xlsx' ){
        
        let file = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var fileURL = URL.createObjectURL(file);
        

        window.open(fileURL);
        this.spinner.hide()
      } else if(ext[1].toLowerCase() == 'docx' ||  ext[1].toLowerCase() == 'doc'){
        
        let file = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        var fileURL = URL.createObjectURL(file);
        

        window.open(fileURL);
        this.spinner.hide()
      } else{
        
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
  save_popUp() {
    $('#myModal1').modal('hide');
  }
  indexmodal = 0

  open(i) {
    this.indexmodal = i
    $('#myModal1').modal('show');
  }
  open1() {

    $('#myModal2').modal('show');
  }
  addline() {
    var arr = new Array()
    if (this.dataarray.length != 0) {
      for (let i = 0; i < this.dataarray.length; i++) {
        arr.push(Object.assign({}, this.dataarray[i]))

      }
    }
    else {
      arr = new Array()
    }
    this.uploadtenderobj['dataArr'].push({ id: '', evaluation_allowed_dataarr: arr, financial_document_id: null, tender_fill_status: 'FILLED' })
  }
  deleteline(i) {

    this.uploadtenderobj['dataArr'].splice(i, 1);
  }
}
