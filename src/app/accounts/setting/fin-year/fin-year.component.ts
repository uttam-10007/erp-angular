import { Component, OnInit,ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { LedgerService } from '../../service/ledger.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-fin-year',
  templateUrl: './fin-year.component.html',
  styleUrls: ['./fin-year.component.css']
})
export class FinYearComponent implements OnInit {
  displayedColumns = ['id', 'fin_year','status', 'action'];
  constructor( private spinner: NgxSpinnerService, private snackBar: MatSnackBar,private ledgerService:LedgerService) { }
  datasource;
  erpUser
  b_acct_id
  allFinYear=[]
  user_id
  obj={}
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getFinYear();
  }
  async getFinYear() {
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.ledgerService.getAllFinYear(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.allFinYear = resp.data;
      this.datasource = new MatTableDataSource(this.allFinYear)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();

    } else {
      this.spinner.hide()

    }
  }
  async addNewRow() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'INACTIVE';
    this.spinner.show();
    var resp = await this.ledgerService.createfinyear(obj);
    if (resp['error'] == false) {
      await this.getFinYear();
      this.spinner.hide();
      swal.fire("Success", "...Added Successfully!",'success');

     
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Request Failed!",'error');

    
    }


  }

  async active(element) {
    var obj = Object.assign({}, element);
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'ACTIVE'
    obj['id'] = element['id']
    this.spinner.show();
    var resp = await this.ledgerService.updatefinyear(obj);
    if (resp['error'] == false) {
      await this.getFinYear();
      this.spinner.hide();
      swal.fire("Success", "...Activated Successfully!",'success');
    } else {
      this.spinner.hide();
      swal.fire("Error", "...Request Failed!",'error');
    }
  }
  refresh(){
    this.obj={};
  }
  async deactive(element) {
    var obj = Object.assign({}, element);
    obj['b_acct_id'] = this.b_acct_id
    obj['status'] = 'INACTIVE'
    obj['id'] = element['id']
    this.spinner.show();
    var resp = await this.ledgerService.updatefinyear(obj);
    if (resp['error'] == false) {
      await this.getFinYear();
      this.spinner.hide();
      swal.fire("Success", "...Deactivated Successfully!",'success');

     /*  this.snackBar.open("Deactivated Successfully", 'Success!', {
        duration: 5000,
      }); */
    } else {
      this.spinner.hide();

      swal.fire("Error", "...Request Failed!",'error');
     /*  this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      }); */
    }
  }

  
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
}
