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
  selector: 'app-exported-tender',
  templateUrl: './exported-tender.component.html',
  styleUrls: ['./exported-tender.component.css']
})
export class ExportedTenderComponent implements OnInit {

  constructor(private verificationService: VerificationService,private settingService:SettingService,private EstimateService:EstimateService,private baseItemService: BaseItemService,private hierarchyService:HierarchyService, private TenderService: TenderService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  Obj = { dataArr: [],cover_dataarr:[],tender_doc_dataarr:[],evaluation_allowed_dataarr :[] };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'name_of_tender', 'tender_opening_date', 'tender_closing_date', 'tender_type_cd', 'packet_type_cd',
    'apply_start_date','apply_end_date','est_value', 'action'];
  datasource;

  allEstimate = [];
  select = [{value:'YES',code:1},{value:'NO',code:0}]
  httpUrl;
  uploadDocObj = {}
  uploadDocArr = []
  fileURL;
  other_details=[{id:'applicable',value:'APPLICABLE'},{id:'not-applicable',value:' NOT APPLICABLE'}]
  tenderstatus = [{value:'Fresh Tender'},{value:'Retender'}]
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
   
   
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAlltender()
    await this.getAllEstimate()
    
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  open() {
    $('#myModal1').modal('show');
  }
  addline() {
    
    this.Obj['dataArr'].push({  issue_for_corrigendum: '', document_id: null })
  }
  addline1() {
    
    this.Obj['tender_doc_dataarr'].push({  document_type: '', document_desc: '', document_id: null })
  }
  addline2() {
    
    this.Obj['evaluation_allowed_dataarr'].push({  document_type: '', document_desc: '', document_id: null })
  }
  deleteline(i) {
    
    this.Obj['dataArr'].splice(i, 1);
  }
  deleteline1(i) {
    
    this.Obj['tender_doc_dataarr'].splice(i, 1);
  }
  deleteline2(i) {
    
    this.Obj['evaluation_allowed_dataarr'].splice(i, 1);
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
    obj['application_id'] =0  //'1-TENDER' //this.Obj['id'] +'-TENDER';
    this.spinner.show()
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/eng/upload/uploadDocument' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      var resp = JSON.parse(response);

      if (resp.error == false) {
         if (this.doc_type == 'BOQ') {
          this.Obj['boq_document_id'] = resp.data;

        } else if (this.doc_type == 'TENDER') {
          this.Obj['dataArr'][this.index]['document_id'] = resp.data;

        }else if (this.doc_type == 'TENDER DOC') {
          this.Obj['tender_doc_dataarr'][this.index]['document_id'] = resp.data;
        } 
        else if(this.doc_type == 'loa_document_id'){
          this.Obj['loa_document_id']=resp['data']
        }
        else if(this.doc_type == 'agreement_doc_id'){
          this.Obj['agreement_doc_id']=resp['data']
        }
        else if(this.doc_type == 'completion_cert_document_id'){
          this.Obj['completion_cert_document_id']=resp['data']
        } 
        else if(this.doc_type == 'blacklist_doc_id'){
          this.Obj['blacklist_doc_id']=resp['data']
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
  changecover(){
    this.Obj['cover_dataarr'] = []
    for (let i = 0; i < this.Obj['num_of_cover']; i++) {
      this.Obj['cover_dataarr'].push({data:''})
    }
   
  }
  async getuploaddocument(file_id){
    let ob = new Object;
    ob['b_acct_id'] = this.b_acct_id
    ob["id"] =file_id  //'1-TENDER'// this.Obj['id']
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
  async open_update(element) {   
   

    this.Obj = Object.assign({}, element);
    this.Obj['num_of_cover'] = String(this.Obj['num_of_cover'])
    if(element['corr_data'] != null){
    this.Obj['dataArr'] = JSON.parse(element['corr_data']);
    }else{
      this.Obj['corr_data'] = []
    }
    if(element['cover_data'] != null){
    this.Obj['cover_dataarr'] = JSON.parse(element['cover_data']);
    }else{
      this.Obj['cover_data'] = []
    }
    if(element['tender_doc_data'] != null){
    this.Obj['tender_doc_dataarr'] = JSON.parse(element['tender_doc_data']);
    }else{
      this.Obj['tender_doc_data'] = []
    }
    if(element['evaluation_allowed_data'] != null){
      this.Obj['evaluation_allowed_dataarr'] = JSON.parse(element['evaluation_allowed_data']);
      }else{
        this.Obj['evaluation_allowed_dataarr'] = []
      }
      if(element['payment_instrument_data'] != null){
        this.Obj['payment_instrument_dataarr'] = JSON.parse(element['payment_instrument_data']);
        }else{
          this.Obj['payment_instrument_dataarr'] = []
        }

    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
  }
  async getAllEstimate() {
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
    
    this.Obj = { dataArr:[],cover_dataarr:[],tender_doc_dataarr:[],evaluation_allowed_dataarr :[]};
    this.Obj['org_chain']=this.mainService.accInfo['account_name']
  }
  save_popUp() {
    $('#myModal1').modal('hide');
  }
changeestimate(){
  for (let i = 0; i < this.allEstimate.length; i++) {
    if(this.Obj['est_id'] == this.allEstimate[i]['id']){
      this.Obj['est_bud'] = this.allEstimate[i]['est_amt']
    }
    
  }
}
  tender = []
  async getAlltender() {
    this.spinner.show()
    var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
   
    var resp = await this.TenderService.gettenders(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tender = resp.data;
      this.datasource = new MatTableDataSource(this.tender);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Estimate !','error');
    }
  }
  async submit(){
    this.spinner.show();   
    this.Obj['payment_instrument_data'] = JSON.stringify(this.Obj['payment_instrument_dataarr']);
     this.Obj['tender_doc_data'] = JSON.stringify(this.Obj['tender_doc_dataarr']);
    this.Obj['cover_data'] = JSON.stringify(this.Obj['cover_dataarr']);
    var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['evaluation_allowed_data'] = JSON.stringify(this.Obj['evaluation_allowed_dataarr']);
    this.Obj['corr_data'] = data;
    this.Obj['create_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    //this.Obj['tender'] = 'EXPORTED'
     var resp = await this.TenderService.createtender(this.Obj);
    if (resp['error'] == false) {
      
      await this.getAlltender();
      this.spinner.hide();
      swal.fire('Success', 'Tender  Created Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while adding  Tender!','error');
    }  
  }
  async broadcast(element){
    this.spinner.show();
    this.Obj = Object.assign({}, element);
    this.Obj['tender_status'] = 'BROADCASTED'
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.TenderService.updatetenderStatus(this.Obj);
    if (resp['error'] == false) {
      await this.getAlltender();
      this.spinner.hide();
      this.Obj = { dataArr: [],cover_dataarr:[],tender_doc_dataarr:[],evaluation_allowed_dataarr :[] };
      swal.fire('Success', 'Tender Broadcasted Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while updating  Tender!','error');
    }
  }
  async update() {

    this.spinner.show();
    
    
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    this.Obj['tender_doc_data'] = JSON.stringify(this.Obj['tender_doc_dataarr']);
    this.Obj['cover_data'] = JSON.stringify(this.Obj['cover_dataarr']);
    this.Obj['evaluation_allowed_data'] = JSON.stringify(this.Obj['evaluation_allowed_dataarr']);
    this.Obj['payment_instrument_data'] = JSON.stringify(this.Obj['payment_instrument_dataarr']);
    var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['corr_data'] = data;
    var resp = await this.TenderService.updatetender(this.Obj);
    if (resp['error'] == false) {
      await this.getAlltender();
      this.spinner.hide();

      swal.fire('Success', 'Tender Updated Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while updating  Tender!','error');
    }
  }
  async delete(element) {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['svayam_tender_id'] = element['svayam_tender_id'];
    var doc_id = []
 
   
    var data = []
    if(element['corr_data'] != null){
       data = JSON.parse(element['corr_data']);
      }else{
         data = []
      }
      
      var tender_doc_dataarr =[]
      if(element['tender_doc_data'] != null){
      tender_doc_dataarr = JSON.parse(element['tender_doc_data']);
      }else{
        tender_doc_dataarr = []
      }
    for (let i = 0; i < data.length; i++) {
      doc_id.push(data[i]['document_id'])
      
    }
    for (let i = 0; i < tender_doc_dataarr.length; i++) {
      doc_id.push(tender_doc_dataarr[i]['document_id'])
      
    }

    obj['doc_id'] = doc_id
     var resp = await this.TenderService.deletetender(JSON.stringify(obj));
    if (resp['error'] == false) {
      await this.getAlltender();

      this.spinner.hide();
      swal.fire('Success', 'Tender Deleted Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while Deleting  Tender !','error');
    } 
  }
}
