import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EventsService } from  '../../service/events.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ThrowStmt } from '@angular/compiler';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HierarchyService } from '../../service/hierarchy.service';

declare var $: any;
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  displayedColumns = ['event_code', 'event_desc', 'action'];
  obj = {}
  erpUser;
  b_acct_id
  data;
  dataSource
  user_id
  selectObj = {}

  allProjectHier=[];
  allProductHier=[];
  allActivityHier=[];
  allBudgetHier=[];
  allBudget = [];
  allProject = [];
  allProduct = [];
  allActivity = [];
  

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(private EventsService: EventsService,private hierarchyService:HierarchyService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }



  async  ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    this.user_id = this.erpUser.user_id;
    //await this.geteventlayout();
    await this.getAllBudget();

    await this.getAllProject();
    await this.getAllProduct();
    await this.getAllActivity();
  //  await this.getevents()
    await this.setData();

  }
  async getAllBudget(){
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='bud_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allBudgetHier = resp.data;
    } else {
      this.spinner.hide()

    }
  }

  async getAllActivity(){
    this.spinner.show()
    var obj = new Object();
    obj['b_acct_id'] = this.b_acct_id;
    obj['table_name']='activity_hier';
    var resp = await this.hierarchyService.getHierarchy(obj);
    if (resp['error'] == false) {
      this.spinner.hide()
      this.allActivityHier = resp.data;
    } else {
      this.spinner.hide()
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

  async getevents() {
    // var obj = Object.assign({}, this.obj);

    // obj['b_acct_id'] = this.b_acct_id;
    // obj['event_record_code'] = 'R101';
    this.spinner.show();
    this.selectObj['b_acct_id']=this.b_acct_id
    var resp = await this.EventsService.getFilteredEvents(this.selectObj);
    if (resp['error'] == false) {
       
      this.dataSource = new MatTableDataSource(resp.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  async addNewRow() {
    var obj = Object.assign({}, this.obj);

    obj['b_acct_id'] = this.b_acct_id
    obj['create_user_id'] = this.user_id
    obj['event_record_code'] = 'R101';
    this.spinner.show();
    var resp = await this.EventsService.addevent(obj);
    console.log(resp)
    if (resp['error'] == false) {

    //  await this.getevents()

      this.spinner.hide();
      this.snackBar.open("Event Added Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open(resp['data'], 'Error', {
        duration: 5000,
      });
    }


  }
  async deleteevent(element, i) {
    var obj = element;

    obj['b_acct_id'] = this.b_acct_id
    this.spinner.show();

    var resp = await this.EventsService.deleteevent(obj);
    if (resp['error'] == false) {
       await this.getevents()
      this.snackBar.open("Event Deleted Successfully", 'Success!', {
        duration: 5000,
      });
      this.spinner.hide();

    } else {
      this.spinner.hide();
      this.snackBar.open("Error occured while getting Schemes", 'Error', {
        duration: 5000,
      });
    }
  }
  changeProject() {
    for (let i = 0; i < this.allProject.length; i++) {
      if (this.selectObj['proj_cd'] == this.allProject[i]['code']) {
        this.selectObj['proj_desc'] = this.allProject[i]['desc'];
        this.selectObj['proj_lvl'] = this.allProject[i]['level'];
      }
    }
  }

  changeProduct() {
    for (let i = 0; i < this.allProduct.length; i++) {
      if (this.selectObj['prod_cd'] == this.allProduct[i]['code']) {
        this.selectObj['prod_desc'] = this.allProduct[i]['desc'];
        this.selectObj['prod_lvl'] = this.allProduct[i]['level'];
      }
    }
  }

  changeActivity() {
    for (let i = 0; i < this.allActivity.length; i++) {
      if (this.selectObj['act_cd'] == this.allActivity[i]['code']) {
        this.selectObj['act_desc'] = this.allActivity[i]['desc'];
        this.selectObj['act_lvl'] = this.allActivity[i]['level'];
      }
    }
  }

  changeBudget() {
    for (let i = 0; i < this.allBudget.length; i++) {
      if (this.selectObj['bud_cd'] == this.allBudget[i]['code']) {
        this.selectObj['bud_desc'] = this.allBudget[i]['desc'];
        this.selectObj['bud_lvl'] = this.allBudget[i]['level'];
      }
    }
  }
  setData() {

    this.allBudget = [];
    var temp = [];
    for (let i = 0; i < this.allBudgetHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allBudgetHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allBudgetHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allBudgetHier[i]['lvl' + j + "_cd"] + " - " + this.allBudgetHier[i]['lvl' + j + "_value"] + " - " + 'Level '+j;
        if ((temp.indexOf(this.allBudgetHier[i]['lvl' + j + "_cd"]) < 0) && this.allBudgetHier[i]['lvl' + j + "_cd"] != null) {
          this.allBudget.push(obj);
          temp.push(this.allBudgetHier[i]['lvl' + j + "_cd"])
        }
      }

      var obj = new Object();
      obj['code'] = this.allBudgetHier[i]['leaf_cd']
      obj['value'] = this.allBudgetHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allBudgetHier[i]['leaf_cd'] + " - " + this.allBudgetHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allBudgetHier[i]['leaf_cd'])
      this.allBudget.splice(p, 1)
      this.allBudget.push(obj)
    }

    temp = []
    this.allProduct = [];
    for (let i = 0; i < this.allProductHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allProductHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allProductHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allProductHier[i]['lvl' + j + "_cd"] + " - " + this.allProductHier[i]['lvl' + j + "_value"] + " - " + 'Level '+j;
        if ((temp.indexOf(this.allProductHier[i]['lvl' + j + "_cd"]) < 0) && this.allProductHier[i]['lvl' + j + "_cd"] != null) {
          this.allProduct.push(obj);
          temp.push(this.allProductHier[i]['lvl' + j + "_cd"])
        }
      }
      var obj = new Object();
      obj['code'] = this.allProductHier[i]['leaf_cd']
      obj['value'] = this.allProductHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allProductHier[i]['leaf_cd'] + " - " + this.allProductHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allProductHier[i]['leaf_cd'])
      this.allProduct.splice(p, 1)
      this.allProduct.push(obj);
    }

    temp = [];
    this.allProject = [];
    for (let i = 0; i < this.allProjectHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allProjectHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allProjectHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allProjectHier[i]['lvl' + j + "_cd"] + " - " + this.allProjectHier[i]['lvl' + j + "_value"] + " - " +'Level '+ j;
        if ((temp.indexOf(this.allProjectHier[i]['lvl' + j + "_cd"]) < 0) && this.allProjectHier[i]['lvl' + j + "_cd"] != null) {
          this.allProject.push(obj);
          temp.push(this.allProjectHier[i]['lvl' + j + "_cd"])
        }
      }
      var obj = new Object();
      obj['code'] = this.allProjectHier[i]['leaf_cd']
      obj['value'] = this.allProjectHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allProjectHier[i]['leaf_cd'] + " - " + this.allProjectHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allProjectHier[i]['leaf_cd'])
      this.allProject.splice(p, 1)
      this.allProject.push(obj);

    }

    temp = [];
    this.allActivity = [];
    for (let i = 0; i < this.allActivityHier.length; i++) {
      for (let j = 1; j <= 7; j++) {
        var obj = new Object();
        obj['code'] = this.allActivityHier[i]['lvl' + j + "_cd"]
        obj['value'] = this.allActivityHier[i]['lvl' + j + "_value"]
        obj['level'] = j
        obj['desc'] = this.allActivityHier[i]['lvl' + j + "_cd"] + " - " + this.allActivityHier[i]['lvl' + j + "_value"] + " - " + 'Level '+j;
        if ((temp.indexOf(this.allActivityHier[i]['lvl' + j + "_cd"]) < 0) && this.allActivityHier[i]['lvl' + j + "_cd"] != null) {
          this.allActivity.push(obj);
          temp.push(this.allActivityHier[i]['lvl' + j + "_cd"])
        }
      }
      var obj = new Object();
      obj['code'] = this.allActivityHier[i]['leaf_cd']
      obj['value'] = this.allActivityHier[i]['leaf_value']
      obj['level'] = 'L'
      obj['desc'] = this.allActivityHier[i]['leaf_cd'] + " - " + this.allActivityHier[i]['leaf_value'] + " - Leaf";
      var p = temp.indexOf(this.allActivityHier[i]['leaf_cd'])
      this.allActivity.splice(p, 1)
      this.allActivity.push(obj)

    }

  }

  async edit(element, i) {
    this.obj = element;
    $('.nav-tabs a[href="#tab-3"]').tab('show')

  }
  async update() {
    var obj = Object.assign({}, this.obj);
    obj['b_acct_id'] = this.b_acct_id
    obj['update_user_id'] = this.user_id
    this.spinner.show();

    var resp = await this.EventsService.updateevent(obj);
    if (resp['error'] == false) {

      

      this.spinner.hide();
      $('.nav-tabs a[href="#tab-1"]').tab('show')
      this.snackBar.open("Event Updated Successfully", 'Success!', {
        duration: 5000,
      });
    } else {
      this.spinner.hide();
      this.snackBar.open("Request Failed", 'Error', {
        duration: 5000,
      });
    }
  }
  refressadd() {
    this.obj = Object.assign({}, {})
  }
  applyFilter(filterValue: string) {

    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
