import { Component, OnInit, AfterViewInit, ViewChild,ViewEncapsulation } from '@angular/core';
import { ScriptLoaderService } from '../../_services/script-loader.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import {UserAddService} from '../service/user-add.service'
import { NgxSpinnerService } from "ngx-spinner";
declare var $: any;
@Component({
  selector: 'app-portal-users',
  templateUrl: './portal-users.component.html',
  styleUrls: ['./portal-users.component.css']
})
export class PortalUsersComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService,private userAdd:UserAddService,private _script: ScriptLoaderService,private snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource;
  erpUser;
  displayedColumns = ['name', 'phone_no','products', 'action'];
  allUser=[];
  updateUser={};
  addUser={};
  user_id;
  b_acct_id;
  availableProd=[];
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.user_id=this.erpUser.user_id;
    this.b_acct_id=this.erpUser.b_acct_id;
    await this.getUsersInfo();
    var assigned_products = this.erpUser.assigned_product_cd;
    var allProd=this.erpUser.active_product_cd;
    var temp=[]
    for(var i=0;i<allProd.length;i++){
      for(var j=0;j<assigned_products.length;j++){
        if(allProd[i].prod_cd == assigned_products[j]){
          temp.push(allProd[i]);
        }
      }
    }
    console.log(temp);
    var obj = new Object();
    obj['prod_cd'] = "NA"
    obj['product_id']= '-1'
    obj['product_name']= "PORTAL"
    obj['product_url']= "http://www.svayamtech.com/portal"
    obj['sample_db_suffix']= "portal";
    temp.push(obj);
    this.availableProd = temp;
    


  }
  async getUsersInfo(){
    var obj={user_id: this.user_id,b_acct_id: this.b_acct_id};
    var resp = await this.userAdd.getUsersInfo(JSON.stringify(obj));
    console.log(resp);
    if(resp['error']==false){
      this.allUser = resp['data'];
      this.dataSource = new MatTableDataSource(this.allUser);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }else{
      
    }
  }

  openUpdate(element,i){
    var resp = Object.assign({},element);
    this.updateUser['user_id']=resp.user_id;
    this.updateUser['email']=resp.email;
    if(resp.prod_cd!=null && resp.prod_cd!=undefined)
    this.updateUser['assigned_products']=resp.prod_cd.split(",");
    else
    this.updateUser['assigned_products']=[]


    console.log(this.updateUser)
    $('.nav-tabs a[href="#tab-7-3"]').tab('show')
  }
  async addUsers(){
    this.spinner.show();
    this.addUser['b_acct_id']=this.b_acct_id;
    this.addUser['email'] = "NA";
    var resp = await this.userAdd.addUsers(this.addUser);
    console.log(resp);
    if(resp['error']==false){
      this.getUsersInfo();
      this.spinner.hide();
      this.snackBar.open("User Added Successfully", 'Success', {
        duration: 5000,
      });

    }else{
      this.spinner.hide();
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000,
      });
    }

  }
  async updateUsers(){
    this.spinner.show();
    this.updateUser['b_acct_id']=this.b_acct_id;
    var resp = await this.userAdd.updateUsers(this.updateUser);
    console.log(resp);
    if(resp['error']==false){
      this.getUsersInfo();
      this.spinner.hide();
      this.snackBar.open("User updated Successfully", 'Success', {
        duration: 5000,
      });

    }else{
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }

  }
  async deleteUsers(element,i){
    this.spinner.show();
    var obj = {user_id: element.user_id,b_acct_id: this.b_acct_id};
    var resp = await this.userAdd.deleteUsers(JSON.stringify(obj));
    console.log(resp);
    if(resp['error']==false){
      this.getUsersInfo();
      this.spinner.hide();
      this.snackBar.open("User Deleted Successfully", 'Success', {
        duration: 5000,
      });

    }else{
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }

  }
  ngAfterViewInit() {
    this._script.load('./assets/js/scripts/form-plugins.js');
  }
  applyFilter(filterValue: string) {
    
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

