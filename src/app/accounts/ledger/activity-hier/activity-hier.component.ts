import { Component, OnInit,ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { HierarchyService } from '../../service/hierarchy.service';
import { FileUploader } from 'ng2-file-upload';
import { MainService } from '../../service/main.service';
import swal from 'sweetalert2';

declare var $: any
@Component({
  selector: 'app-activity-hier',
  templateUrl: './activity-hier.component.html',
  styleUrls: ['./activity-hier.component.css']
})
export class ActivityHierComponent implements OnInit {

  constructor(private mainService:MainService,private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar,private hierarchyService:HierarchyService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns = ['id','lvl1_cd', 'lvl1_value', 'lvl2_cd', 'lvl2_value','lvl3_cd', 'lvl3_value','lvl4_cd', 'lvl4_value','lvl5_cd', 'lvl5_value','lvl6_cd', 'lvl6_value','lvl7_cd', 'lvl7_value','leaf_cd','leaf_value','action'];
  datasource;
  erpUser

  obj={};
  b_acct_id
  allHier=[];


  allBudgetHier=[];
  allProjectHier=[];
  allProductHier=[];
  level1=[];
  level2=[]
  level3=[]
  level4=[]
  level5=[]
  level6=[]
  level7=[]
  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.httpUrl = this.mainService.httpUrl;
    this.uploader = new FileUploader({ url: this.httpUrl, itemAlias: 'file' });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.getAllHier();
    // this.getAllBudget();
    // this.getAllProject();
    // this.getAllProduct();
  }

  async getAllBudget(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='bud_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allBudgetHier = resp.data;
    } else {
    }
  }

  async getAllProject(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='proj_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProjectHier = resp.data;
    } else {
    }
  }

  async getAllProduct(){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='prod_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allProductHier = resp.data;
    } else {
    }
  }

event_arr = [];

makeEventArr(budArr, prodArr, projArr, avtObj) {
    this.event_arr = []
    for (let i = 0; i < budArr.length; i++) {

        for (let j = 0; j < prodArr.length; j++) {

            for (let k = 0; k < projArr.length; k++) {

                let obj = new Object;
                obj["event_code"] = budArr[i]["leaf_cd"]  + " - " + prodArr[j]["leaf_cd"] + " - " + projArr[k]["leaf_cd"]+ " - " + avtObj["leaf_cd"]
                obj["event_desc"] = budArr[i]["leaf_value"] + " from " + avtObj["leaf_value"] + " of " + prodArr[j]["leaf_value"] + " for " + projArr[k]["leaf_value"]
                obj["event_record_code"] = "R101"
                this.event_arr.push(obj)
            }

        }

    }

}

  
  async getAllHier() {
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='activity_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.allHier = resp.data;
      this.datasource = new MatTableDataSource(this.allHier)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide()
    }
  }

  async save() {
   this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    this.obj['table_name']='activity_hier';
    //await this.makeEventArr(this.allBudgetHier,this.allProductHier,this.allProjectHier,this.obj);
    this.obj['event_arr']=[];
    var resp = await this.hierarchyService.createHierarchy(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();

      await this.getAllHier();
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
    this.obj['table_name']='activity_hier';
    var resp = await this.hierarchyService.updateHierarchy(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllHier();
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



 async delete(element){
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;
    obj['table_name']='activity_hier';
    this.spinner.show()
    var resp = await this.hierarchyService.deleteHierarchy(obj);
    if (resp['error'] == false) {
      await this.getAllHier()
      this.spinner.hide();
      this.snackBar.open("Delete Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide()
    }
  }











  

  async onChangeLvl1(){
    for(let i=0;i<this.level1.length;i++){
      if(this.level1[i]['lvl1_cd']==this.obj['lvl1_cd']){
        this.obj['lvl1_value']=this.level1[i]['lvl1_value']
      }
    }
    let temp=[]
    this.level2=[]
    for(let i=0;i<this.allHier.length;i++){
      if(this.allHier[i]['lvl1_cd']==this.obj['lvl1_cd']){
        if(!temp.includes(this.allHier[i]['lvl2_cd'])){
          temp.push(this.allHier[i]['lvl2_cd'])
          let ob=new Object()
          ob['lvl2_cd']=this.allHier[i]['lvl2_cd']
          ob['lvl2_value']=this.allHier[i]['lvl2_value']
          this.level2.push(ob)
          }
      }

    }
    this.level3=[]
    this.level4=[]
    this.level5=[]
    this.level6=[]
    this.level7=[]

    for(let i=2;i<8;i++){
      this.obj['lvl'+i+'_cd']=null
      this.obj['lvl'+i+'_value']=null
     
    }

    await this.makingLeafValues()


  }

  async  onChangeLvl2(){
    for(let i=0;i<this.level2.length;i++){
      if(this.level2[i]['lvl2_cd']==this.obj['lvl2_cd']){
        this.obj['lvl2_value']=this.level2[i]['lvl2_value']
      }
    }
    let temp=[]
    this.level3=[]
    for(let i=0;i<this.allHier.length;i++){
      if(this.allHier[i]['lvl2_cd']==this.obj['lvl2_cd']){
        if(!temp.includes(this.allHier[i]['lvl3_cd'])){
          temp.push(this.allHier[i]['lvl3_cd'])
          let ob=new Object()
          ob['lvl3_cd']=this.allHier[i]['lvl3_cd']
          ob['lvl3_value']=this.allHier[i]['lvl3_value']
          this.level3.push(ob)
          }
      }

    }
    this.level4=[]
    this.level5=[]
    this.level6=[]
    this.level7=[]

    for(let i=3;i<8;i++){
      this.obj['lvl'+i+'_cd']=null
      this.obj['lvl'+i+'_value']=null
     
    }

    await this.makingLeafValues()


  }

  
  async  onChangeLvl3(){
    for(let i=0;i<this.level3.length;i++){
      if(this.level3[i]['lvl3_cd']==this.obj['lvl3_cd']){
        this.obj['lvl3_value']=this.level3[i]['lvl3_value']
      }
    }
    let temp=[]
    this.level4=[]
    for(let i=0;i<this.allHier.length;i++){
      if(this.allHier[i]['lvl3_cd']==this.obj['lvl3_cd']){
        if(!temp.includes(this.allHier[i]['lvl4_cd'])){
          temp.push(this.allHier[i]['lvl4_cd'])
          let ob=new Object()
          ob['lvl4_cd']=this.allHier[i]['lvl4_cd']
          ob['lvl4_value']=this.allHier[i]['lvl4_value']
          this.level4.push(ob)
          }
      }

    }
    this.level5=[]
    this.level6=[]
    this.level7=[]

    for(let i=4;i<8;i++){
      this.obj['lvl'+i+'_cd']=null
      this.obj['lvl'+i+'_value']=null
     
    }


    await this.makingLeafValues()

  }
  
  async   onChangeLvl4(){
    for(let i=0;i<this.level4.length;i++){
      if(this.level4[i]['lvl4_cd']==this.obj['lvl4_cd']){
        this.obj['lvl4_value']=this.level4[i]['lvl4_value']
      }
    }
    let temp=[]
    this.level5=[]
    for(let i=0;i<this.allHier.length;i++){
      if(this.allHier[i]['lvl4_cd']==this.obj['lvl4_cd']){
        if(!temp.includes(this.allHier[i]['lvl5_cd'])){
          temp.push(this.allHier[i]['lvl5_cd'])
          let ob=new Object()
          ob['lvl5_cd']=this.allHier[i]['lvl5_cd']
          ob['lvl5_value']=this.allHier[i]['lvl5_value']
          this.level5.push(ob)
          }
      }

    }
    this.level6=[]
    this.level7=[]

    for(let i=5;i<8;i++){
      this.obj['lvl'+i+'_cd']=null
      this.obj['lvl'+i+'_value']=null
     
    }

    await this.makingLeafValues()


  }
  
  async   onChangeLvl5(){
    for(let i=0;i<this.level5.length;i++){
      if(this.level5[i]['lvl5_cd']==this.obj['lvl5_cd']){
        this.obj['lvl5_value']=this.level5[i]['lvl5_value']
      }
    }
    let temp=[]
    this.level6=[]
    for(let i=0;i<this.allHier.length;i++){
      if(this.allHier[i]['lvl5_cd']==this.obj['lvl5_cd']){
        if(!temp.includes(this.allHier[i]['lvl6_cd'])){
          temp.push(this.allHier[i]['lvl6_cd'])
          let ob=new Object()
          ob['lvl6_cd']=this.allHier[i]['lvl6_cd']
          ob['lvl6_value']=this.allHier[i]['lvl6_value']
          this.level6.push(ob)
          }
      }

    }
    this.level7=[]

    for(let i=6;i<8;i++){
      this.obj['lvl'+i+'_cd']=null
      this.obj['lvl'+i+'_value']=null
     
    }

    await this.makingLeafValues()


  }

  
  async  onChangeLvl6(){
    for(let i=0;i<this.level6.length;i++){
      if(this.level6[i]['lvl6_cd']==this.obj['lvl6_cd']){
        this.obj['lvl6_value']=this.level6[i]['lvl6_value']
      }
    }
    let temp=[]
    this.level7=[]
    for(let i=0;i<this.allHier.length;i++){
      if(this.allHier[i]['lvl6_cd']==this.obj['lvl6_cd']){
        if(!temp.includes(this.allHier[i]['lvl7_cd'])){
          temp.push(this.allHier[i]['lvl7_cd'])
          let ob=new Object()
          ob['lvl7_cd']=this.allHier[i]['lvl7_cd']
          ob['lvl7_value']=this.allHier[i]['lvl7_value']
          this.level7.push(ob)
          }
      }

    }

    for(let i=7;i<8;i++){
      this.obj['lvl'+i+'_cd']=null
      this.obj['lvl'+i+'_value']=null
     
    }

    await this.makingLeafValues()


  }

  async  onChangeLvl7(){
    for(let i=0;i<this.level7.length;i++){
      if(this.level7[i]['lvl7_cd']==this.obj['lvl7_cd']){
        this.obj['lvl7_value']=this.level7[i]['lvl7_value']
      }
    }
  
    await this.makingLeafValues()



  }
 async open_update(element) {
   this.spinner.show()
   this.refresh()
    this.obj=Object.assign({},element);
   await this.onChangeLvl1();
   this.obj=Object.assign({},element);

   await this.onChangeLvl2();
   this.obj=Object.assign({},element);

   await this.onChangeLvl3();
   this.obj=Object.assign({},element);

   await this.onChangeLvl4();
   this.obj=Object.assign({},element);

   await this.onChangeLvl5();
   this.obj=Object.assign({},element);

   await this.onChangeLvl6();
   this.obj=Object.assign({},element);

this.spinner.hide()
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  



  refresh(){
    let temp=[]
    this.level1=[]
    for(let i=0;i<this.allHier.length;i++){
if(!temp.includes(this.allHier[i]['lvl1_cd'])){
temp.push(this.allHier[i]['lvl1_cd'])
let ob=new Object()
ob['lvl1_cd']=this.allHier[i]['lvl1_cd']
ob['lvl1_value']=this.allHier[i]['lvl1_value']
this.level1.push(ob)
}
    }
    this.obj={};
    this.level2=[]

    this.level3=[]
    this.level4=[]
    this.level5=[]
    this.level6=[]
    this.level7=[]
  }

async  addNew(i){
    if(this.obj['lvl'+i+'_type']=='text'){
      this.obj['lvl'+i+'_type']=''
      
    }else{
      this.obj['lvl'+i+'_type']='text'
    
    }
    this.obj['lvl'+i+'_cd']=null
    this.obj['lvl'+i+'_value']=null
    for(let j=i;j<8;j++){
      if(this.obj['lvl'+j+'_type']!='text'){
      this.obj['lvl'+j+'_cd']=null
      this.obj['lvl'+j+'_value']=null
      }
      
    }
    await this.makingLeafValues()
    
      }

      async  makingLeafValues(){

        if(this.obj['lvl7_cd']!=undefined && this.obj['lvl7_cd']!='' && this.obj['lvl7_cd']!=null ){
        this.obj['leaf_cd']=this.obj['lvl7_cd']
        this.obj['leaf_value']=this.obj['lvl7_value']
        }else if (this.obj['lvl6_cd']!=undefined && this.obj['lvl6_cd']!='' && this.obj['lvl6_cd']!=null){
        this.obj['leaf_cd']=this.obj['lvl6_cd']
        this.obj['leaf_value']=this.obj['lvl6_value']
        }else if (this.obj['lvl5_cd']!=undefined && this.obj['lvl5_cd']!='' && this.obj['lvl5_cd']!=null){
        this.obj['leaf_cd']=this.obj['lvl5_cd']
        this.obj['leaf_value']=this.obj['lvl5_value']
        }else if (this.obj['lvl4_cd']!=undefined && this.obj['lvl4_cd']!='' && this.obj['lvl4_cd']!=null){
        this.obj['leaf_cd']=this.obj['lvl4_cd']
        this.obj['leaf_value']=this.obj['lvl4_value']
        }else if (this.obj['lvl3_cd']!=undefined && this.obj['lvl3_cd']!='' && this.obj['lvl3_cd']!=null){
        this.obj['leaf_cd']=this.obj['lvl3_cd']
        this.obj['leaf_value']=this.obj['lvl3_value']
        }else if (this.obj['lvl2_cd']!=undefined && this.obj['lvl2_cd']!='' && this.obj['lvl2_cd']!=null){
        this.obj['leaf_cd']=this.obj['lvl2_cd']
        this.obj['leaf_value']=this.obj['lvl2_value']
        }else if (this.obj['lvl1_cd']!=undefined && this.obj['lvl1_cd']!='' && this.obj['lvl1_cd']!=null){
        this.obj['leaf_cd']=this.obj['lvl1_cd']
        this.obj['leaf_value']=this.obj['lvl1_value']
        }
        
        
        }
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
    this.mainService.exportAsExcelFile(arr1,arr2,"Activity-Template")
  }
  leafDetection(){
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
    obj['table_name'] = 'activity_hier';
    var data = []
   
    
    obj["event_record_code"] = "R101" 

    
    
    this.spinner.show()
    if(extention[1].toLowerCase() == 'xlsx'){
      const params = JSON.stringify(obj);
      this.uploader.queue[0].url = this.httpUrl + '/accounts/hierarchy/processHierarchyFile' + params;
      this.uploader.queue[0].upload();
      this.uploader.onCompleteItem = async (item: any, response: any, status: any, headers: any) => {
        var resp = JSON.parse(response)
        if (resp.error == false) {
          await this.getAllHier();
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
}
