import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { JoiningService } from '../../service/joining.service';
import { AllEmpService } from '../../service/all-emp.service'
import { from } from 'rxjs';
import { MainService } from '../../service/main.service'
import swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';
import { ScriptLoaderService } from '../../../_services/script-loader.service';

declare var $: any;

@Component({
  selector: 'app-all-emp',
  templateUrl: './all-emp.component.html',
  styleUrls: ['./all-emp.component.css']
})
export class AllEmpComponent implements OnInit {

  constructor(private _script: ScriptLoaderService, private sanitizer: DomSanitizer, public mainService: MainService, private allEmpService: AllEmpService, private joiningservice: JoiningService, private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


    
  @ViewChild('paginator1', { static: false }) paginator1: MatPaginator;
  @ViewChild('sortCol2', { static: false }) sortCol2: MatSort;


  displayedColumns = ['emp_id', 'emp_name', 'emp_email', 'emp_father_name', 'emp_phone_no', 'action'];
  displayedColumns1 = ['emp_id', 'emp_name', 'document_name', 'document_type', 'action'];
  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;
  adhar = false;
  pancard = false;
  datasource;
  datasource1;

  b_acct_id;
  erpUser;
  party_status_code;
  allEmplyees = [];
  empObj = {};
  personalInfoObj = {};
  selectEmpObj = {};
  errorMsg = ''
  uploadObj = {}
  empNameObj = {}
  filename;
  project_short_name;
  allEmplyees_new = []
  async ngOnInit() {
    this.httpUrl = this.mainService.httpUrl;

    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.project_short_name=this.mainService.accInfo['account_short_name'];
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getAllEmployees();
  }
  getNumberFormat(num){
   
    if(num!=undefined){
      return num.toString().padStart(3, "0")

    }else{
      return '000';
    }
  }
  async getAllEmployees() {
    this.spinner.show()
    var arr = []
    this.allEmplyees = []
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.allEmpService.getAllPartyFields(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide()
     arr = resp.data;
       for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        this.allEmplyees.push(obj)
      } 
      this.allEmplyees_new=[];
      for(let i=0;i<resp.data.length;i++){
        var obj=new Object();
        obj=Object.assign({},resp.data[i]);
        obj['emp_name']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])+"-"+obj['emp_name']
        this.allEmplyees_new.push(obj)
      }
      for (let i = 0; i < this.allEmplyees.length; i++) {
        this.empNameObj[this.allEmplyees[i]['emp_id']] = this.allEmplyees[i]['emp_name']
      }
      this.datasource = new MatTableDataSource(this.allEmplyees)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
    } else {
      this.spinner.hide()

    }
  }

  openUpdate(element) {
    this.empObj = element;
    $('.nav-tabs a[href="#tab-2"]').tab('show');
  }

  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  async changeEmployee() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['emp_id'] = this.selectEmpObj['emp_id'];
    this.spinner.show();
    var resp = await this.allEmpService.getPersonalInfo(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      if (resp.data.length > 0)
        this.personalInfoObj = resp.data[0];
      else {
        this.personalInfoObj = {};
      }

    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting employee list", 'Error', {
        duration: 5000
      });
    }
  }


  
  async updatePersonalInfo() {


  if(this.personalInfoObj['emp_pan_no'] == "" || this.personalInfoObj['emp_pan_no'] == undefined){
   
    }
    else{
      this.panValidate()
    }
    if(this.personalInfoObj['emp_adhar_no'] == "" || this.personalInfoObj['emp_adhar_no'] == undefined){
      
      }
      else{
        this.AadharValidate()
      }
   
 
      
      if (false) {

      }
      else {

        swal.fire({
          title: 'Are you sure?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, Update it!'
        }).then((result) => {
          if (result.value) {
            this.finalupdatePersonalInfo()
          }
        })


      }
    
  }
  async finalupdatePersonalInfo() {
    this.personalInfoObj['b_acct_id'] = this.b_acct_id;
    this.personalInfoObj['party_id'] = this.selectEmpObj['party_id'];
    this.personalInfoObj['update_user_id'] = this.erpUser.user_id;
    this.personalInfoObj['emp_gst_no'] = '123'
    this.spinner.show();
    var resp = await this.allEmpService.updatePersonalInfo(this.personalInfoObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      swal.fire("Success", "...Personal Info Updated!",'success');


    } else {
      this.spinner.hide();
      swal.fire("Error", "Some Error Occurred!",'error');

    }
  }



  async upload() {

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['document_name'] = this.uploader.queue[0].some.name;
    obj['document_type_code'] = this.uploadObj['document_type_code'];
    obj['emp_id'] = this.uploadObj['emp_id'];

    obj['create_user_id'] = this.erpUser.user_id;
    this.spinner.show()
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/hr/establishment_info/uploadfile/uploadFile' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      if (!response.error) {
        this.spinner.hide()
        this.snackBar.open("File Uploaded Successfully", 'Success', {
          duration: 5000
        });


      } else {
        this.spinner.hide()

        this.snackBar.open(JSON.parse(response.data), 'Error', {
          duration: 5000
        });

      }
    };
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

  async updatedob(){
    this.personalInfoObj['b_acct_id'] = this.b_acct_id;
    this.personalInfoObj['party_id'] = this.selectEmpObj['party_id'];
    this.personalInfoObj['update_user_id'] = this.erpUser.user_id;
    this.personalInfoObj['emp_gst_no'] = '123'
    var arr = this.personalInfoObj['emp_dob'].split("-")
         arr[0]= parseInt(arr[0]) + 60
         if(arr[2] > 1){
           
         }
         else{
           if(arr[1] == 1){
            arr[1]= 12
            arr[0]= parseInt(arr[0]) -1
  
           }else{
            arr[1]= parseInt(arr[1]) -1
           }
          
         }
           //arr[0] = parseInt(arr[0]) +1
           if(parseInt(arr[1]) <= 7){
           if ((parseInt(arr[1]) % 2) == 0 && (parseInt(arr[1])) != 2) {
            
              arr[2] = 30
            
          }
          else if ((parseInt(arr[1])) == 2) {
            if ((parseInt(arr[0]) % 4) == 0) {
              
                arr[2] = 29
              
            }
            else {
              arr[2] = 28
            }
          } else {
            arr[2] = 31
          }
        }else{
          if ((parseInt(arr[1]) % 2) == 0 && (parseInt(arr[1])) != 2) {
            
            arr[2] = 31
          
        }
        else if ((parseInt(arr[1])) == 2) {
          if ((parseInt(arr[0]) % 4) == 0) {
            
              arr[2] = 29
            
          }
          else {
            arr[2] = 28
          }
        } else {
          arr[2] = 30
        }
        }
         
         var date =arr[0]+"-"+arr[1]+"-"+arr[2]
    this.personalInfoObj['retirement_date'] = date
    this.spinner.show();
    var resp = await this.allEmpService.updatedob(this.personalInfoObj);
    if (resp['error'] == false) {
      this.spinner.hide();
      //swal.fire("Success", "...Date of Birth Updated!");
      this.snackBar.open("...Date of Birth Updated!", 'Error', {
        duration: 5000
      });
  
  
    } else {
      this.spinner.hide();
      swal.fire("Error", "Some Error Occurred!",'error');
  
    }
  }
  

  async viewDocumments(element) {
    var arr =[]
    var Employees = []
    var obj = new Object;
    obj['b_acct_id'] = this.b_acct_id
    obj['emp_id'] = element.emp_id

    var resp = await this.allEmpService.getUploadedFiles(JSON.stringify(obj));
    if (resp['error'] == false) {
      arr = resp.data;
      for(let i=0;i<arr.length;i++){
        var obj=new Object();
        obj=Object.assign({},arr[i]);
       obj['tempid']=this.mainService.accInfo['account_short_name']+this.getNumberFormat(obj['emp_id'])
        Employees.push(obj)
      }
      this.datasource1 = new MatTableDataSource(Employees)
      this.datasource1.paginator = this.paginator1;
      this.datasource1.sort = this.sortCol2
    } else {

    }
    $('.nav-tabs a[href="#tab-4"]').tab('show');
  }

  async view(element) {
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['upload_id'] = element.id
    obj['filename'] = element.document_name
    this.filename = element.document_name
    this.spinner.show()
    const res = await this.allEmpService.getUploadedFileData(obj);
    if (res) {
     
     var docname = element.document_name;
     var ext = docname.split('.');
     
      if(ext[1] == 'png' || ext[1] == 'jpeg' || ext[1] == 'jpg'){
        const unsafeImageUrl = window.URL.createObjectURL(res);
        this.imgURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeImageUrl);
      }else{
        let file = new Blob([res], { type: 'application/pdf' });            
        var fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      }

      this.spinner.hide()

    }
  }

  AadharValidate() {
    var aadhar = this.personalInfoObj['emp_adhar_no'].toString();
    var adharcardTwelveDigit = /^\d{12}$/;
    var adharSixteenDigit = /^\d{16}$/;
    if (aadhar != '') {
      if (aadhar.match(adharcardTwelveDigit)) {
        this.adhar = true;
      }
      else if (aadhar.match(adharSixteenDigit)) {
        this.adhar = true;
      }
      else {
        this.errorMsg = "* Aadhar must be 12 digit."
        this.adhar = false;
      }
    }
  }
  panValidate() {
    var pan = this.personalInfoObj['emp_pan_no'].toString();;
    var panno = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (pan != '') {
      if (pan.match(panno)) {
        this.pancard = true;
      }

      else {
        this.errorMsg = "* Pan is Invalid."
        this.pancard = false;
      }
    }
  }
  applyFilter1(filterValue: string) {

    this.datasource1.filter = filterValue.trim().toLowerCase();
  }
}
