import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { SorService } from '../service/sor.service'
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { MainService } from '../service/main.service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import swal from 'sweetalert2';
declare var $: any
@Component({
  selector: 'app-sor-selection',
  templateUrl: './sor-selection.component.html',
  styleUrls: ['./sor-selection.component.css']
})
export class SorSelectionComponent implements OnInit {
  constructor(public mainService: MainService, private SorS: SorService, private spinner: NgxSpinnerService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  list = ['id','item_id', 'sor_item_category', 'region_cd', 'circle_cd','proj_cd','act_cd','bud_cd','prod_cd', 'action'];
  datasource;
  action = [{ id: 'update_new', value: 'UPDATE EXISTING' }, { id: 'new', value: 'NEW' }]
  data = []
  Add_row = []
  header = {}
  erpUser;
  b_acct_id;
  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
    await this.getItemList()
    await this.getsorItemList()
  }

  add_row() {
    this.Add_row.push({ item_code: '', item_work: '', desc: '', pwd_spec: '', unit: '', rate: '' })
  }
 
  itemList = []
  async getItemList() {
    this.spinner.show()
    var resp = await this.SorS.getListOfItems(this.b_acct_id)
    if (resp['error'] == false) {
      this.itemList = resp['data']
      // this.datasource = new MatTableDataSource(this.itemList);
      // this.datasource.sort = this.sort;
      // this.datasource.paginator = this.paginator;
      this.spinner.hide()
    }
    else {
      this.spinner.hide()
      swal.fire("Error", "...Error while getting  item list!",'error');

    }

  }
  refresh(){
    this.header=[]
    this.table_data=[]
  }
 async getsorItemList(){
   this.spinner.show()
   let dummy=[]
  var resp = await this.SorS.getSorSelectedList(this.b_acct_id)
  if (resp['error'] == false) {
    this.spinner.hide()
    dummy = resp['data']
    this.datasource = new MatTableDataSource(dummy);
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;

  }
  else {
    this.spinner.hide()
    swal.fire("Error", "...Error while getting  item list!",'error');

  }
  }

  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
  delete(s) {
    this.Add_row.splice(s, 1)
  }
  table_data = []

  show_table() {
    this.table_data=[]
    let dummy = []
    for (let i = 0; i < this.itemList.length; i++) {
      if (this.header['id'] == this.itemList[i]['id']) {
        this.header=this.itemList[i]
        dummy = JSON.parse(this.itemList[i]['data'])
        for (let j = 0; j < dummy.length; j++) {
          this.table_data.push(dummy[j])
          this.table_data[j]['select'] = false
        }
      }
    }
  }
  async save() {
  
    this.spinner.show();
    let obj = {}
    obj = this.header;
    obj['item_id']=this.header['id']
    obj['data'] = JSON.stringify(this.table_data)
    obj['create_user_id'] = this.erpUser.user_id
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.SorS.createSorSelected(obj)
    if (resp['error'] == false) {
      await this.getsorItemList()
      this.spinner.hide()
      swal.fire('Successfully Submitted', '', 'success')
    }
    else {
      this.spinner.hide()
      swal.fire("Error", "...Error while creating item list",'error');

    }
  }

 


  async delete_item(e) {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = [e['id']]
    var resp = await this.SorS.deleteSorSelectedList(JSON.stringify(obj))
    if (resp['error'] == false) {
      await this.getsorItemList()
      this.spinner.hide()
      swal.fire('Success', 'Item Deleted Successfully','success')

    }
    else {
      this.spinner.hide()
      swal.fire("Error", "...Error while deleteing  item list!",'error');

    }
  }
  open_update(e) {
    this.header = e
    this.header['id']=e['item_id']
    this.table_data = JSON.parse(e['data']);
    $('.nav-tabs a[href="#tab-3"]').tab('show');
  }
  async update() {
    this.spinner.show()
    let obj = {}
    obj = this.header
    obj['b_acct_id'] = this.b_acct_id
    obj['data'] = JSON.stringify(this.table_data)
    obj['update_user_id'] = this.erpUser.user_id
    var resp = await this.SorS.updateSorSelectedList(obj)
    if (resp['error'] == false) {
      await this.getItemList()
      this.spinner.hide()
      swal.fire('Success', 'Item Updated Successfully','success')

    }
    else {
      this.spinner.hide()
      swal.fire("Error", "...Error while Updating item list!",'error');

    }
  }
  async print1(e) {

    var header = e;
    var data = JSON.parse(e.data);
    var txt = 'Selected Item List';
    var dd = {
      pageSize: 'A3',
      header: function (currentPage, pageCount) {
        var arr = []
        var obj = { text: txt + "  Page No. - " + currentPage, alignment: 'center', margin: [72, 40], fontSize: 15, bold: true };
        arr.push(obj);
        return arr;
      },
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 60],
      content: [

      ]
    };




    var header1 = {
      columns: [
        {
          width: '*',
          text: 'Item Category Code :',
          bold: true
        },

        {
          width: '*',
          text: header['sor_item_category']
        },
        {

          width: '*',
          text: 'Region :',
          bold: true
        },
        {
          width: '*',
          text: header['region_cd']
        }
      ],

    }
    var header2 = {
      columns: [
        {
          width: '*',
          text: 'Circle :',
          bold: true

        },
        {
          width: '*',
          text: header['circle_cd']
        },
        {
          width: '*',
          text: 'Budget',
          bold: true
        },
        {
          width: '*',
          text: header['bud_cd']
        }
      ],

    }
    var header3 = {
      columns: [
        {
          width: '*',
          text: 'project :',
          bold: true

        },
        {
          width: '*',
          text: header['proj_cd']
        },
        {
          width: '*',
          text: 'Activity',
          bold: true
        },
        {
          width: '*',
          text: header['act_cd']
        }
      ],

    }
    var header4 = {
      columns: [
        {
          width: '*',
          text: 'Product:',
          bold: true

        },
        {
          width: '*',
          text: header['prod_cd']
        },
        {
          width: '*',
          text: '',
          bold: true
        },
        {
          width: '*',
          text: ''
        }
      ],

    }

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });


    dd.content.push({ text: " " });
    dd.content.push(header1);
    dd.content.push(header2);
    dd.content.push(header3);
    dd.content.push(header4);

    dd.content.push({ text: " " });

    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });


    var header8 = {
      columns: [
        {
          width: '*',
          text: 'SR NO.',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Item Code',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Item Of Work',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Item Description',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'PWD Specification',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Unit',
          bold: true,
          alignment: 'left'
        },
        {
          width: '*',
          text: 'Rate',
          bold: true,
          alignment: 'left'
        }
      ]



    }

    dd.content.push(header8);
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 0.5 }] });
    dd.content.push({ text: " " });

    for (var i = 0; i < data.length; i++) {
      var objRow = {
        columns: [
        ],
      }
      var ob = Object.keys(data[i]);
      for (var j = 0; j < ob.length; j++) {
        if (j == 0) {
          objRow.columns.push({
            width: '*',
            text: i + 1,
            alignment: 'left'
          })
        }
        else {
          objRow.columns.push({
            width: '*',
            text: data[i][ob[j]],
            alignment: 'left'
          })
        }
      }

      dd.content.push(objRow);
      dd.content.push({ text: " " });
    }
    dd.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 1115, y2: 0, lineWidth: 2 }] });
    dd.content.push({ text: " " });




    pdfMake.createPdf(dd).download('selectedList.pdf');

  }

}
