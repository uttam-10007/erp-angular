import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { EstablishmentService } from '../service/establishment.service';
import {MainService} from '../service/main.service';
import { JsonPipe } from '@angular/common';
declare var $: any
import swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';
import { ScriptLoaderService } from '../../_services/script-loader.service';
@Component({
  selector: 'app-hrms-notification',
  templateUrl: './hrms-notification.component.html',
  styleUrls: ['./hrms-notification.component.css']
})
export class HrmsNotificationComponent implements OnInit {

  constructor(public mainService : MainService, private sanitizer: DomSanitizer,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar, private allEmpServ: EstablishmentService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'subject', 'description', 'action'];
  datasource;
  employeeObj={};
  erpUser;
  b_acct_id;
  ERObj = {};
  selectEmpObj = {};
  completeERObj={};
  allEmployees = [];
  employeeIdtoName = {};
  allArr=[];

  Obj={};

  uploadObj = {}
  imageBlobUrl;
  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;

    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    await this.getNotice();
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



  async upload() {

    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    const obj = new Object();
    obj['b_acct_id'] = this.erpUser.b_acct_id;
    obj['document_name'] = this.uploader.queue[0].some.name;
    obj['description'] = this.Obj['description'];
    obj['document_type_code'] = 'NOTICE';
    obj['subject'] = this.Obj['subject'];
    obj['create_user_id'] = this.erpUser.user_id;
    
    this.spinner.show()
    const params = JSON.stringify(obj);
    this.uploader.queue[0].url = this.httpUrl + '/hr/setting/notice/insertnotice' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      if (!response.error) {
        this.getNotice();
        this.spinner.hide();
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

  async getNotice() {
this.spinner.show()
    var resp = await this.allEmpServ.getAllNotice(this.b_acct_id);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.datasource = new MatTableDataSource(resp.data)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting notice list", 'Error', {
        duration: 5000
      });
    }
  }

 async  delete(element){
   this.spinner.show()
   var obj=new Object();
   obj['b_acct_id']=this.b_acct_id;
   obj['id']=element.id;

    var resp = await this.allEmpServ.deleteNotice(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.getNotice();
      this.spinner.hide();
      this.snackBar.open("Notice Deleted Successfully", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while deleting notice", 'Error', {
        duration: 5000
      });
    }
  }

  open_update(element){
    this.Obj=Object.assign({},element);
    $('.nav-tabs a[href="#tab-3"]').tab('show'); 
  }
 async update(){
   this.spinner.show()
    this.Obj['b_acct_id']=this.b_acct_id;
     var resp = await this.allEmpServ.updateNotice(this.Obj);
     if (resp['error'] == false) {
       this.getNotice();
       this.spinner.hide();
       this.snackBar.open("Notice Update Successfully", 'Success', {
         duration: 5000
       });
     } else {
       this.spinner.hide()
       this.snackBar.open("Error while updating notice", 'Error', {
         duration: 5000
       });
     }
  }
 
  filename;
  async view(element) {
    var obj = new Object
    obj['b_acct_id'] = this.b_acct_id
    obj['upload_id'] = element.upload_id
    obj['filename'] = element.document_name
    this.filename = element.document_name
    this.spinner.show()
    const res = await this.allEmpServ.getUploadedFileData(obj);
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

  applyFilter(filterValue: string) {

    this.datasource.filter = filterValue.trim().toLowerCase();
  }


  


}
