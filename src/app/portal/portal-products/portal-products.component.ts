import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {ProdcutsService} from '../service/prodcuts.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-portal-products',
  templateUrl: './portal-products.component.html',
  styleUrls: ['./portal-products.component.css']
})
export class PortalProductsComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService,private snackBar: MatSnackBar,private router: Router,private prodService: ProdcutsService) { }
  erpUser;
  allAvailable={}
  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    if(this.erpUser.is_admin==0){
        this.router.navigate(['/index']);
    }
   
    for(var i=0;i<this.erpUser.active_product_cd.length;i++){
      this.allAvailable[this.erpUser.active_product_cd[i].prod_cd] = this.erpUser.active_product_cd[i];
    }
    
    for(var i=0;i<this.erpUser.active_product_cd.length;i++){
      if(this.erpUser.assigned_product_cd.indexOf(this.erpUser.active_product_cd[i].prod_cd)>-1){
        this.erpUser.active_product_cd[i].status=1;
      }else{
        this.erpUser.active_product_cd[i].status=0;
      }
    }

  }
  async activate(cd,j){
    var keys=[cd];
    var ob = new Object();
    ob["b_acct_id"]=this.erpUser.b_acct_id;
    ob["user_id"] = this.erpUser.user_id;
    ob["sample_db"]=[];
    ob["product_databases"]=[];

    ob['prod_codes']=[];

    ob["database_codes"]=[];

    ob["domain_info"]=[]
    for(var i=0;i<keys.length;i++){
    
      ob["sample_db"].push("svayam_"+this.allAvailable[keys[i]].sample_db_suffix);
      ob["product_databases"].push("svayam_"+this.erpUser.b_acct_id+"_"+this.allAvailable[keys[i]].sample_db_suffix);
  
      ob['prod_codes'].push(keys[i]);
  
      ob["database_codes"].push(keys[i]);
  
      ob["domain_info"].push({domain_code:keys[i],domain_db_suffix:this.allAvailable[keys[i]].sample_db_suffix,domain_name:this.allAvailable[keys[i]].product_name});
  
     
    }
    console.log(ob);
    this.spinner.show();
    var resp = await this.prodService.addProducts(ob);
    if(resp['error']==false){
     
     
      this.erpUser.assigned_product_cd.push(cd);
      this.erpUser.active_product_cd[j].status=1;
      
      localStorage.setItem('erpUser',JSON.stringify(this.erpUser));
     
  
     
      this.spinner.hide();
      this.snackBar.open("Product Added Successfully", 'Success', {
        duration: 5000,
      });
    }else{
      this.spinner.hide();
      this.snackBar.open("Failed", 'Error', {
        duration: 5000,
      });


    }
    

  }
  async deactivate(cd,j){
    if(cd=="MDR" || cd=="USERMGMT"){
      this.snackBar.open("Product Can not be Removed", 'Error', {
        duration: 5000,
      });
    }else{
      var ob = new Object();
      ob["b_acct_id"]=this.erpUser.b_acct_id;
      ob["user_id"] = this.erpUser.user_id;
  
      ob["product_databases"]="svayam_"+this.erpUser.b_acct_id+"_"+this.allAvailable[cd].sample_db_suffix;
  
      ob['prod_codes']=cd;
  
      ob["database_codes"]=cd;
  
      
      this.spinner.show();
      var resp = await this.prodService.removeProduct(ob);
      if(resp['error']==false){
       
        var ind;

        for(var k=0;k<this.erpUser.assigned_product_cd.length;k++){
          if(this.erpUser.assigned_product_cd[k]==cd){
            ind=k;
          }
        }
        this.erpUser.assigned_product_cd.splice(ind,1);
        this.erpUser.active_product_cd[j].status=0;
        console.log(this.erpUser);
        localStorage.setItem('erpUser',JSON.stringify(this.erpUser));
       
    
       
        this.spinner.hide();
        this.snackBar.open("Product Deactivated Successfully", 'Success', {
          duration: 5000,
        });
      }else{
        this.spinner.hide();
        this.snackBar.open("Failed", 'Error', {
          duration: 5000,
        });
  
  
      }
    }
 
   
    

  }

}
