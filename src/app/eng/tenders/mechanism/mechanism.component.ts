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
  selector: 'app-mechanism',
  templateUrl: './mechanism.component.html',
  styleUrls: ['./mechanism.component.css']
})
export class MechanismComponent implements OnInit {

  constructor(private verificationService: VerificationService, private settingService: SettingService, private EstimateService: EstimateService, private baseItemService: BaseItemService, private hierarchyService: HierarchyService, private TenderService: TenderService, public mainService: MainService, private _script: ScriptLoaderService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;
  httpUrl;
  allEstimate = []
  allExportedTenders = []
  selectedEstimateTenders = []
  Obj = {firm_data:[],loa_award_obj:{},payment_data:[],work_period_obj:{},extension_data:[],escalation_data:[],deviation_data:[]}
  allImportedTenders = []
  tenderResult = []
  typeOfFirmArr=[{code:'SINGLE'},{code:'JV'}]
  verficationArr=[{code:'ONGOING'},{code:'VERIFIED'},{code:'REJECT'}]
  extGrantedArr=[{code:'YES'},{code:'NO'}]
  loaActionArr=[{code:'SUBMITED'},{code:'TERMINATE'},{code:'PENDING'}]
  uploadDocObj={}
  uploadDocArr=[]
  systemDate;
  tender_name={}
  datasource
  allTenderMechanism=[]
  displayedColumns = ['est_id','svayam_tender_id','name_of_tender', 'nic_tender_id', 'verification_status',
  'status', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;

    var resp = await this.TenderService.getSystemDate();
    this.systemDate = resp.data


    await this.getAlltender()
    await this.getAllEstimate()
    await this.getAllimportedtender()
    await this.getAlltenderMechanism()



  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async getAllEstimate() {
    let resp = await this.EstimateService.getestimate(this.b_acct_id);
    if (resp['error'] == false) {
      this.allEstimate = resp.data;

      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Estimate !','error');
    }
  }

  async getAlltender() {
    let obj = Object()
    obj['b_acct_id'] = this.b_acct_id

    let resp = await this.TenderService.gettenders(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allExportedTenders = resp.data;
      for (let i = 0; i < this.allExportedTenders.length; i++) {
        this.tender_name[this.allExportedTenders[i]['svayam_tender_id']] = this.allExportedTenders[i]['tender_name']
        
      }
      // this.datasource = new MatTableDataSource(this.tender);
      // this.datasource.sort = this.sort;
      // this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Exported Tenders !','error');
    }
  }
  async getAllimportedtender() {
    let obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    obj['tender'] = 'IMPORTED'
    let resp = await this.TenderService.getimportedTenderss(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allImportedTenders = resp.data;

      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All tender !','error');
    }
  }
  changeestimate() {

    this.selectedEstimateTenders = []
    this.Obj['loa_award_obj']=new Object
        this.Obj['firm_data']=[]
        this.Obj['payment_data']=[]
        this.Obj['work_period_obj']=new Object
        this.Obj['extension_data']=[]
        this.Obj['escalation_data']=[]
        this.Obj['deviation_data']=[]
    for (let i = 0; i < this.allExportedTenders.length; i++) {
      if (this.Obj['est_id'] == this.allExportedTenders[i]['est_id']) {
        this.selectedEstimateTenders.push(this.allExportedTenders[i])
      }

    }
  }
  async changeTender() {
    for (let i = 0; i < this.selectedEstimateTenders.length; i++) {
      if (this.Obj['svayam_tender_id'] == this.selectedEstimateTenders[i]['svayam_tender_id']) {
        this.Obj = Object.assign({}, this.selectedEstimateTenders[i])
        this.Obj['loa_award_obj']=new Object
        this.Obj['firm_data']=[]
        this.Obj['payment_data']=[]
        this.Obj['work_period_obj']=new Object
        this.Obj['extension_data']=[]
        this.Obj['escalation_data']=[]
        this.Obj['deviation_data']=[]


      }

    }
    for (let i = 0; i < this.allImportedTenders.length; i++) {
      if (this.Obj['svayam_tender_id'] == this.allImportedTenders[i]['svayam_tender_id']) {

        this.Obj['nic_tender_id'] = this.allImportedTenders[i]['nic_tender_id']
        this.Obj['tender_ref_no'] = this.allImportedTenders[i]['tender_ref_no']
        this.Obj['no_of_applicants'] = this.allImportedTenders[i]['no_of_applicants']


      }

    }
    let obj = Object()
    obj['b_acct_id'] = this.b_acct_id
    obj['svayam_tender_id'] = this.Obj['svayam_tender_id']
    let resp = await this.TenderService.gettenderResult(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.tenderResult = resp.data;
      for (let i = 0; i < this.tenderResult.length; i++) {
        if (this.tenderResult[i]['rank'] == 'L1') {

          this.Obj['l1_firm_name'] = this.tenderResult[i]['firm_name']
          this.Obj['l1_application_id'] = this.tenderResult[i]['application_id']

        }
        if (this.tenderResult[i]['rank'] == 'L2') {

          this.Obj['l2_firm_name'] = this.tenderResult[i]['firm_name']
          this.Obj['l2_application_id'] = this.tenderResult[i]['application_id']

        }
      }
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting tender Result!','error');
    }
  }
  changeNoOfFirms(){
    this.Obj['firm_data']=[]
    for(let i=0;i<this.Obj['no_of_firms'];i++){
      this.Obj['firm_data'].push(Object.assign({},{}))
    }
  }
 
  async getuploaddocument(file_id){
    this.spinner.show()
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
  addPaymentLine(){
    this.Obj['payment_data'].push(Object.assign({},{}))
  }
  deletePaymentLine(j){
    this.Obj['payment_data'].splice(j,1)
  }
  addExtensionLine(){
    this.Obj['extension_data'].push(Object.assign({},{}))
  }
  deleteextensionLine(k){
    this.Obj['extension_data'].splice(k,1)

  }
  addEscalationLine(){
    this.Obj['escalation_data'].push(Object.assign({},{}))
  }
  deleteEscalationLine(l){
    this.Obj['escalation_data'].splice(l,1)

  }
  addDeviationLine(){
    this.Obj['deviation_data'].push(Object.assign({},{}))
  }
  deleteDeviationLine(m){
    this.Obj['deviation_data'].splice(m,1)

  }
  refresh(){
    this.Obj=Object.assign({},{firm_data:[],loa_award_obj:{},payment_data:[],work_period_obj:{},extension_data:[],escalation_data:[],deviation_data:[]})
  }
  generateLoa(){
    this.Obj['loa_generate_doc_id']=this.Obj['loa_document_id']
    this.Obj['loa_generate_date']=this.systemDate
  }
  generateAgreement(){
    this.Obj['agreement_generate_doc_id']=this.Obj['agreement_doc_id']
    this.Obj['agreement_generate_date']=this.systemDate
  }

  generateCC(){
    this.Obj['completion_cert_generate_document_id']=this.Obj['completion_cert_document_id']
    this.Obj['completion_cert_generate_date']=this.systemDate
  }

  async submit(){
    this.spinner.show()
    let ob=this.Obj
    ob['b_acct_id']=this.b_acct_id
    ob['create_user_id']= this.erpUser.user_id
    ob['status']= 'VERIFYING'
    // ob['loa_award_obj']= JSON.stringify(this.Obj['loa_award_obj'])
    // ob['firm_data']=  JSON.stringify(this.Obj['firm_data'])
    // ob['payment_data']=  JSON.stringify(this.Obj['payment_data'])
    // ob['work_period_obj']=   JSON.stringify(this.Obj['work_period_obj'])
    // ob['extension_data']=  JSON.stringify( this.Obj['extension_data'])
    // ob['escalation_data']= JSON.stringify(this.Obj['escalation_data'])
    // ob['deviation_data']=JSON.stringify( this.Obj['deviation_data'])
    let resp = await this.TenderService.createtendermechanism(ob);
    if (resp['error'] == false) {
      this.spinner.hide();
      swal.fire('Success', 'Submitted Successfully!','success');
  await this.getAlltenderMechanism()
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while creating tender Mechanism!','error');
    }

  }

  async getAlltenderMechanism() {
    this.spinner.show()
    let obj = Object()
    obj['b_acct_id'] = this.b_acct_id

    let resp = await this.TenderService.gettendermechanism(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allTenderMechanism=resp['data']
      this.datasource = new MatTableDataSource(resp['data']);
      this.datasource.sort = this.sort;
      this.datasource.paginator = this.paginator;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while getting All Tenders Mechanisms!','error');
    }
  }

  open_update(element){
    this.Obj=element
    this.Obj['loa_award_obj']=JSON.parse(element['loa_award_obj'])
    this.Obj['firm_data']=JSON.parse(element['firm_data'])
    this.Obj['payment_data']=JSON.parse(element['payment_data'])
    this.Obj['work_period_obj']=JSON.parse(element['work_period_obj'])
    this.Obj['extension_data']=JSON.parse(element['extension_data'])
    this.Obj['escalation_data']=JSON.parse(element['escalation_data'])
    this.Obj['deviation_data']=JSON.parse(element['deviation_data'])
    for (let i = 0; i < this.allExportedTenders.length; i++) {
      if (this.Obj['svayam_tender_id'] == this.allExportedTenders[i]['svayam_tender_id']) {
     
        this.Obj['tender_name']= this.allExportedTenders[i]['tender_name']
        this.Obj['tender_desc']= this.allExportedTenders[i]['tender_desc']
        this.Obj['est_bud']= this.allExportedTenders[i]['est_bud']
        this.Obj['work_period']= this.allExportedTenders[i]['work_period']
        this.Obj['tender_inviting_auth_department']= this.allExportedTenders[i]['tender_inviting_auth_department']
        this.Obj['bid_validity']= this.allExportedTenders[i]['bid_validity']
        this.Obj['method_of_selection']= this.allExportedTenders[i]['method_of_selection']
        // this.Obj['method_of_selection']= this.allExportedTenders[i]['method_of_selection']
        // this.Obj['method_of_selection']= this.allExportedTenders[i]['method_of_selection']
        // this.Obj['method_of_selection']= this.allExportedTenders[i]['method_of_selection']


      }

    }
    for (let i = 0; i < this.allImportedTenders.length; i++) {
      if (this.Obj['svayam_tender_id'] == this.allImportedTenders[i]['svayam_tender_id']) {

        this.Obj['tender_ref_no'] = this.allImportedTenders[i]['tender_ref_no']
        this.Obj['no_of_applicants'] = this.allImportedTenders[i]['no_of_applicants']


      }

    }
    $('.nav-tabs a[href="#tab-7-3"]').tab('show');

  }

 async save(){
   this.spinner.show()
  let ob=this.Obj
  ob['b_acct_id']=this.b_acct_id
  ob['update_user_id']= this.erpUser.user_id 
  let resp = await this.TenderService.updatetendermechanism(ob);
  if (resp['error'] == false) {
    swal.fire('Success', 'Saved Successfully!','success');
await this.getAlltenderMechanism()
    this.spinner.hide();
  } else {
    this.spinner.hide();
    swal.fire('Error', 'Error while saving Mechanism!','error');
  }
  }
  async delete(element){
    this.spinner.show()
    let ob=this.Obj
    ob['b_acct_id']=this.b_acct_id
    ob['update_user_id']= this.erpUser.user_id

    ob['id']= element['id']   
    let resp = await this.TenderService.deletetendermechanism(JSON.stringify(ob));
    if (resp['error'] == false) {
      swal.fire('Success', 'Deleted Successfully!','success');
  await this.getAlltenderMechanism()
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while deleting Mechanism!','error');
    }
  }

  async complete(element){
    this.spinner.show()
    let ob=this.Obj
    ob['b_acct_id']=this.b_acct_id
    ob['update_user_id']= this.erpUser.user_id

    ob['id']= element['id']
    ob['status']= 'COMPLETED'   
  let resp = await this.TenderService.updatetendermechanismstatus(ob);
    if (resp['error'] == false) {
      this.spinner.hide();
      swal.fire('Success', 'Completed Successfully!','success');
  await this.getAlltenderMechanism()
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while completing Mechanism!','error');
    }
  }
  async terminate(element){
    this.spinner.show()
    let ob=this.Obj
    ob['b_acct_id']=this.b_acct_id
    ob['update_user_id']= this.erpUser.user_id

    ob['id']= element['id']
    ob['status']= 'TERMINATED'   
    let resp = await this.TenderService.updatetendermechanismstatus(ob);
    if (resp['error'] == false) {
      swal.fire('Success', 'Terminated Successfully!','success');
  await this.getAlltenderMechanism()
      this.spinner.hide();
    } else {
      this.spinner.hide();
      swal.fire('Error', 'Error while terminating Mechanism!','error');
    }
  }
  
}
