import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { SettingService } from '../../service/setting.service';
import { MainService } from '../../service/main.service';
declare var $: any
@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit {

  constructor(private settingService: SettingService,public mainService: MainService,  private router: Router, private spinner: NgxSpinnerService, private snackBar: MatSnackBar) { }
  erpUser;
  b_acct_id;

  allSection = [];
  obj = {};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['id', 'department_code','office_code','section_code', 'action'];
  datasource;

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    console.log("Mohit ");
    console.log(this.b_acct_id);
    await this.getAllSection();
  }

  open_update(element) {
    this.obj = Object.assign({}, element);
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }

  refresh() {
    this.obj = {};
  }

  async getAllSection() {
    this.spinner.show()
    var resp = await this.settingService.getAllSections(this.b_acct_id);
    console.log(resp)
    if (resp['error'] == false) {
      this.allSection = resp.data;
      this.datasource = new MatTableDataSource(this.allSection)
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.spinner.hide();
    } else {
      this.spinner.hide()
      this.snackBar.open("Error while getting  all Section list", 'Error', {
        duration: 5000
      });
    }
  }
  async save() {
    this.spinner.show();
    this.obj['create_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.createSection(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSection();
      this.snackBar.open("Section Added Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while Adding Section", 'Error', {
        duration: 5000
      });
    }
  }

  async update() {
    this.spinner.show();
    this.obj['update_user_id'] = this.erpUser.user_id;
    this.obj['b_acct_id'] = this.b_acct_id;
    var resp = await this.settingService.updateSection(this.obj);
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSection();
      this.snackBar.open("Section Update Successfully!", 'Success', {
        duration: 5000
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Error while updating Section", 'Error', {
        duration: 5000
      });
    }
  }

  async delete(element) {
    this.spinner.show();
    var obj=new Object();
    obj['b_acct_id']=this.b_acct_id
    obj['id']=element.id;
    var resp = await this.settingService.deleteSection(JSON.stringify(obj));
    if (resp['error'] == false) {
      this.spinner.hide();
      await this.getAllSection();
      this.snackBar.open("Section Delete Successfully!", 'Success', {
        duration: 5000
      });

    } else {
      this.spinner.hide();
      this.snackBar.open("Error while deleting Section", 'Error', {
        duration: 5000
      });
    }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }


}
