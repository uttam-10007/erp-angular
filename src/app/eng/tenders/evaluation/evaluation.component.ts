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
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {

  constructor(private verificationService: VerificationService,private settingService:SettingService,private EstimateService:EstimateService,private baseItemService: BaseItemService,private hierarchyService:HierarchyService, private TenderService: TenderService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  Obj = {  };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id', 'name_of_tender', 'tender_opening_date', 'tender_closing_date', 'tender_type_cd', 'packet_type_cd',
    'apply_start_date','apply_end_date','est_value', 'action'];
  datasource;
  allBaseItem = [];
  allEstimate = [];
status = [{value:'QUAIFIED'},{value:'DISQUALIFIED'}]
  httpUrl;
  uploadDocObj = {}
  uploadDocArr = []
  fileURL;
  select;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
   // this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
   // this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAlltender()
    await this.getAllEstimate()
    await this.getAllimportedtender()
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  save_popUp(){
    
  }
  async open_update(element) {
    this.Obj = Object.assign({}, element);
    this.Obj['dataArr'] = JSON.parse(element['data']);   
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');
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
  }
  techevaluationdata = []
  finevaluationdata = []
  tenderapplication = []
  tenderapplicationname = []
async changeestimate(){
  this.spinner.show();
  this.techevaluationdata = []
  this.finevaluationdata = []
  this.tenderapplication = []
  this.tenderapplicationname = []
  var id = this.Obj['impoted_tender_id']
  var flag = false;
  for (let i = 0; i < this.importedtender.length; i++) {
    if(this.Obj['impoted_tender_id'] == this.importedtender[i]['id']){
      flag = true;
      var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
     obj['svayam_tender_id'] = this.tender[i]['svayam_tender_id'] 
     obj['payment_status'] = 'SUCCESS'
    var resp = await this.TenderService.getTenderApplications(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tenderapplication= resp.data;
      var arr = []
      for (let j = 0; j < this.tenderapplication.length; j++) {
        if(this.tenderapplication[j]['tender_fill_status'] == 'FILLED' && this.tenderapplication[j]['svayam_tender_id'] == this.importedtender[i]['svayam_tender_id']){
          var obj = Object()
          obj['id'] =  this.tenderapplication[j]['id']
          obj['tender_fill_status'] =  this.tenderapplication[j]['tender_fill_status']
          obj['evaluation_allowed_dataarr'] = JSON.parse(this.tenderapplication[j]['technical_document_data'])
          obj['financial_document_id'] =  this.tenderapplication[j]['financial_document_id']
          obj['firm_name'] =  this.tenderapplication[j]['firm_name']
          this.techevaluationdata.push(obj)
          
          this.tenderapplicationname.push(obj)
       arr.push(obj) 
        }
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Expoted Tender Applications !','error');
    }
      this.Obj = Object.assign({}, this.importedtender[i]);
      
      
      
        
    }
   
  }
  for (let i = 0; i < this.tender.length; i++) {
    if(this.Obj['svayam_tender_id'] == this.tender[i]['svayam_tender_id']){
      this.Obj['tender_name'] =this.tender[i]['tender_name']
      this.Obj['tender_desc'] =this.tender[i]['tender_desc']
      this.Obj['tender_category'] =this.tender[i]['tender_category']
      this.Obj['evaluation_allowed'] =this.tender[i]['evaluation_allowed']
      this.Obj['method_of_selection'] =this.tender[i]['method_of_selection']
      this.Obj['tender_fee'] =this.tender[i]['tender_fee']
    }
  }
  if(flag == false){
    this.Obj = {}
  }
  this.Obj['impoted_tender_id'] = id
}
changeoffervalue(i){
  var offer_value = this.finevaluationdata[i]['offer_value']
  var value =  (offer_value/this.Obj['tender_fee']) * 100
  
  this.finevaluationdata[i]['below_and_avg'] =(value - 100 ).toFixed(0)

}
  tender = []
  async getAlltender() {
    this.spinner.show()
    var obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    obj['tender'] = 'EXPORTED'
    var resp = await this.TenderService.gettenders(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tender = resp.data;
     
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Estimate !','error');
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
      swal.fire('Error', 'Error while getting All Estimate !','error');
    }
  }
  selectedtender
  changetender(){
    for (let i = 0; i < this.importedtender.length; i++) {
      if(this.selectedtender == this.importedtender[i]['id']){
        this.Obj = this.importedtender[i]
        this.Obj['tender_id'] = this.selectedtender
      }
    }

  }
  async submit(){ 
    this.spinner.show()
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
    this.Obj['result_status'] = 'ALLOTED'
    this.Obj['tender_application_id'] = this.scorearr[0]['id']
    var data = []
    for (let i = 0; i < this.scorearr.length; i++) {
      var obj = Object.assign({},this.scorearr[i])
      obj['technical_document_data'] = JSON.stringify(obj['evaluation_allowed_dataarr'])
      data.push(obj)
      
    }
    this.Obj['data'] = data
      var resp = await this.TenderService.updateimportedTenders(this.Obj);
    if (resp['error'] == false) {
      
      await this.getAllimportedtender();
      this.spinner.hide();
      swal.fire('Success', 'Evaluation  Done Successfully!!','success');
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while adding  Evaluation!','error');
    }  
  }
  async update() {

   
    this.spinner.show()
    
    this.Obj['update_user_id'] = this.erpUser.user_id;
    this.Obj['b_acct_id'] = this.b_acct_id;
   /*  var data = JSON.stringify(this.Obj['dataArr']);
    this.Obj['data'] = data; */
    var resp = await this.TenderService.updatetender(this.Obj);
    if (resp['error'] == false) {
      await this.getAllimportedtender();
      this.spinner.hide();

      swal.fire('Success', 'Tender Updated Successfully!!','success');
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
  indexmodal
  open(i) {
   
    this.indexmodal = i
    $('#myModal1').modal('show');
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
  enable_financial(){
    this.finevaluationdata = []
    var finarr = []
    for (let i = 0; i < this.techevaluationdata.length; i++) {
     if(this.techevaluationdata[i]['technical_status'] =='QUAIFIED'){
    
      finarr.push(Object.assign({}, this.techevaluationdata[i]))
     }
      
    }
    this.finevaluationdata = finarr
  }
  scorearr = []
  gnerate_score(){
    this.scorearr = []
    var finarr = []
    for (let i = 0; i < this.finevaluationdata.length; i++) {
     if(this.finevaluationdata[i]['financial_status'] =='QUAIFIED'){
    
      finarr.push(Object.assign({}, this.finevaluationdata[i]))
     }
      
    }
    if(this.Obj['method_of_selection'] == 'ics'){
      var arr = finarr.sort((a, b) => (a.marks > b.marks) ? 1 : -1)
      var j = 1
      for (let i = arr.length -1; i >= 0; i--) {
       var obj = Object.assign({}, arr[i])
       obj['rank'] = 'L'+j 
        this.scorearr.push(obj)
        j++;
         
       }
       this.finevaluationdata = this.scorearr
    }
    else{
      var arr = finarr.sort((a, b) => (a.marks > b.marks) ? 1 : -1)
      var j = 1
      for (let i = arr.length -1; i >= 0; i--) {
       var obj = Object.assign({}, arr[i])
       obj['rank'] ='L'+j 
        this.scorearr.push(obj)
        j++;
         
       }
    }
  }
}
