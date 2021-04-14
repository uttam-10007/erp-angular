import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SubSchemeService } from '../../service/sub-scheme.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import {MainService} from '../../service/main.service';
import swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { FileUploader } from 'ng2-file-upload';
import { ScriptLoaderService } from '../../../_services/script-loader.service';
import { SchemeService } from '../../service/scheme.service';


import { MatSnackBar } from '@angular/material/snack-bar';
declare var $: any;
@Component({
  selector: 'app-subscheme',
  templateUrl: './subscheme.component.html',
  styleUrls: ['./subscheme.component.css']
})
export class SubschemeComponent implements OnInit {
  displayedColumns = ['scheme_code', 'sub_scheme_code','sub_scheme_name','mode_of_allotement', 'action'];
  obj={}
  erpUser;
  b_acct_id
  data;
  dataSource
  user_id
  schemeObject={}
  schemeArr;
  selectedSchemeCode;
  statusArr=[{code:"BOOKLETPURCHSE",value:"BOOKLET PURCHASE"},{code:"APPLICATION",value:"APPLICATION"},{code:"ALLOTMENT",value:"ALLOTMENT"},{code:"CLOSED",value:"CLOSED"}]




  imgURL
  selectedFile: File = null;
  isUpload;
  public imagePath;
  httpUrl;
  uploader;




  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private schemeService: SchemeService,private _script: ScriptLoaderService,private sanitizer: DomSanitizer,public mainService: MainService,private subSchemeService: SubSchemeService,private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id =this.erpUser.b_acct_id;
    this.user_id =this.erpUser.user_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
  
    await this.getAllschemes();
  }

  async getAllschemes(){
    this.spinner.show();

    var resp = await this.schemeService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      
      for(let i=0;i<this.schemeArr.length;i++){
        this.schemeObject[this.schemeArr[i]['scheme_code']]=this.schemeArr[i]['scheme_name']
                }
                this.spinner.hide();
      
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Cost Informations", 'Error', {
        duration: 5000,
      });
    }
  }

  async getAllsubSchemes(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code']=this.selectedSchemeCode;
    this.spinner.show();

    var resp = await this.subSchemeService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.data = resp.data;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub-Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  
 
  
      async open_update(element, i) {
        this.obj=element;
        this.obj['sub_scheme_status']=this.obj['sub_scheme_status'].split(",");

      $('.nav-tabs a[href="#tab-3"]').tab('show')
  
      }
      async update(){
        var obj=Object.assign({},this.obj);
        obj['b_acct_id']=this.b_acct_id
        obj['update_user_id']=this.user_id;
        obj['sub_scheme_status']=obj['sub_scheme_status'].join(",");

        this.spinner.show();
       
        var resp = await this.subSchemeService.updatesubscheme(obj);
        if (resp['error'] == false) {
          await this.getAllsubSchemes();
          this.spinner.hide();
         $('.nav-tabs a[href="#tab-1"]').tab('show')
         this.snackBar.open("Scheme Updated Successfully", 'Success!', {
          duration: 5000,
        });
        } else {
          this.spinner.hide();
          this.snackBar.open("Request Failed", 'Error', {
            duration: 5000,
          });
        }
      }
      refressadd(){
        this.obj=Object.assign({},{})
      }
      applyFilter(filterValue: string) {

        this.dataSource.filter = filterValue.trim().toLowerCase();
      }

      async save(){
        var obj=Object.assign({},this.obj);
        obj['b_acct_id']=this.b_acct_id
        obj['create_user_id']=this.user_id;
        obj['sub_scheme_status']=obj['sub_scheme_status'].join(",");
       obj['brochure_file_name'] = this.uploader.queue[0].some.name;
       const params = JSON.stringify(obj);
        this.spinner.show();

        this.uploader.queue[0].url = this.httpUrl + '/property/subscheme/createSubSubcheme' + params;
        this.uploader.queue[0].upload();
        this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
          if (!response.error) {
            this.spinner.hide()
            this.snackBar.open("Sub-Scheme Added Successfully" ,'Success',{
              duration:5000
            });
            
    
          } else {
            this.spinner.hide()
    
            this.snackBar.open(JSON.parse(response.data) ,'Error',{
              duration:5000
            });
    
          }
        };
        // this.spinner.show();
        // var resp = await this.subSchemeService.createsubScheme(obj);
        // if (resp['error'] == false) {
        //   //await this.getAllsubSchemes();
        //   this.spinner.hide();
        //   this.snackBar.open("Sub-Scheme Added Successfully", 'Success!', {
        //     duration: 5000,
        //   });
        // } else {
        //   this.spinner.hide();
        //   this.snackBar.open("Request Failed", 'Error', {
        //     duration: 5000,
        //   });
        // }
      
    
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

  file_open_update(element,i){
    this.obj=element;

      $('.nav-tabs a[href="#tab-4"]').tab('show')
  }

  async UpdateFile(){
    var obj=Object.assign({},this.obj);
    obj['b_acct_id']=this.b_acct_id
    obj['update_user_id']=this.user_id;
   obj['brochure_file_name'] = this.uploader.queue[0].some.name;
   const params = JSON.stringify(obj);
   this.spinner.show();
    this.uploader.queue[0].url = this.httpUrl + '/property/subscheme/updatefileofSubScheme' + params;
    this.uploader.queue[0].upload();
    this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
      if (!response.error) {
        this.spinner.hide()
        this.snackBar.open("Updated Successfully" ,'Success',{
          duration:5000
        });
        

      } else {
        this.spinner.hide()

        this.snackBar.open(JSON.parse(response.data) ,'Error',{
          duration:5000
        });

      }
    };
  }
}
