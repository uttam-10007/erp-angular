import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BookletPurchaseService } from '../../service/booklet-purchase.service';
import { NgxSpinnerService } from "ngx-spinner";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataService } from '../../service/metadata.service';
import { MainService } from '../../service/main.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
declare var $: any;

@Component({
  selector: 'app-booklet-purchase',
  templateUrl: './booklet-purchase.component.html',
  styleUrls: ['./booklet-purchase.component.css']
})
export class BookletPurchaseComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private metadataService: MetadataService, private bookletPurchaseService: BookletPurchaseService, 
    private snackBar: MatSnackBar,private mainService:MainService, private spinner: NgxSpinnerService) { }
  dataSource;
  displayedColumns = ['party_id', 'party_name', 'booklet_purchase_date', 'booklet_amount', 'booklet_challan_no', 'arr_status_code', 'action'];
  partyArr = [];
  schemeArr = [];
  schemeObj = {};
  partyObj = {};
  allBookletPurchase = [];
  bookletPurchaseObj = {};
  allSchemes = [];
  b_acct_id;
  erpUser;
  selectedSchemeCode = "";

  allSubSchemes = [];
  partyName = '';

  bookletAmount = 0;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getAllSchemes();
  }

  async changeScheme() {
    this.spinner.show();
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] =this.bookletPurchaseObj['scheme_code']
    var resp = await this.bookletPurchaseService.getsubScheme(obj);
    if (resp['error'] == false) {
      this.allSubSchemes = resp.data;
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Sub-Schemes", 'Error', {
        duration: 5000,
      });
    }
  }

  async getAllSchemes() {
    this.spinner.show()
    var resp = await this.bookletPurchaseService.getScheme(this.b_acct_id);
    if (resp['error'] == false) {
      this.schemeArr = resp.data;
      for (let i = 0; i < this.schemeArr.length; i++) {
        this.schemeObj[this.schemeArr[i]['scheme_code']] = this.schemeArr[i]['scheme_name']
      }
      this.spinner.hide();

    } else {
      this.spinner.hide();

      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }


  async getBookletPusrchase() {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['scheme_code'] = this.bookletPurchaseObj['scheme_code']
    obj['sub_scheme_code'] = this.bookletPurchaseObj['sub_scheme_code']
    var resp = await this.bookletPurchaseService.getAllbookletpurchase(obj);
    if (resp['error'] == false) {
      this.allBookletPurchase = resp.data;
      this.dataSource = new MatTableDataSource(this.allBookletPurchase);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();

      this.snackBar.open("Error occured while getting BookletPurchases", 'Error', {
        duration: 5000,
      });
    }
  }

  async  approve(element, i) {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;
    obj['arr_status_code'] = 'BOOKLET_PURCHASED'
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.bookletPurchaseService.changeStatusbookletpurchase(obj);
    if (resp['error'] == false) {
      await this.getBookletPusrchase();
      this.spinner.hide();

    } else {
      this.spinner.hide();

      this.snackBar.open("Error occured while change status  of BookletPurchases", 'Error', {
        duration: 5000,
      });
    }
  }

  async  reject(element, i) {
    this.spinner.show();

    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['id'] = element.id;
    obj['arr_status_code'] = 'BOOKLET_PURCHASE_REJECTED'
    obj['update_user_id'] = this.erpUser.user_id;
    var resp = await this.bookletPurchaseService.changeStatusbookletpurchase(obj);
    if (resp['error'] == false) {
      await this.getBookletPusrchase();
      this.spinner.hide();

    } else {
      this.spinner.hide();

      this.snackBar.open("Error occured while change status of BookletPurchases", 'Error', {
        duration: 5000,
      });
    }
  }
  /*  async addBookletPurchase(){
     this.bookletPurchaseObj['b_acct_id'] = this.b_acct_id;
     this.bookletPurchaseObj['txn_amt'] = this.bookletAmount;
     this.bookletPurchaseObj['create_user_id']=this.erpUser.user_id;
     this.spinner.show();
     var resp = await this.bookletPurchaseService.addbookletpurchase(this.bookletPurchaseObj);
     if (resp['error'] == false) {
       await this.getAllBookletPurchase();
       this.spinner.hide();
       this.snackBar.open("Added Successfully", 'Success', {
         duration: 5000,
       });
     } else {
       
       this.spinner.hide();
       this.snackBar.open("Error occured while Adding Booklet Purchase", 'Error', {
         duration: 5000,
       });
     }
 
   }
   openUpdate(element,i){
     this.bookletPurchaseObj=element;
     $('.nav-tabs a[href="#tab-3"]').tab('show')
   }
 
   
   async updateBookletPurchase(){
     this.bookletPurchaseObj['b_acct_id'] = this.b_acct_id;
     this.bookletPurchaseObj['update_user_id']=this.erpUser.user_id;
     
     this.spinner.show();
     var resp = await this.bookletPurchaseService.updatebookletpurchase(this.bookletPurchaseObj);
     if (resp['error'] == false) {
       this.spinner.hide();
       this.snackBar.open("Updated Successfully", 'Success', {
         duration: 5000,
       });
     } else {
       
       this.spinner.hide();
       this.snackBar.open("Error occured while Updating Booklet Purchase", 'Error', {
         duration: 5000,
       });
     }
   } */

  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
