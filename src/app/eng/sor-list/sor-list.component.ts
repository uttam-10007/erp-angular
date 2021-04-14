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
  selector: 'app-sor-list',
  templateUrl: './sor-list.component.html',
  styleUrls: ['./sor-list.component.css']
})
export class SorListComponent implements OnInit {

  constructor(public mainService: MainService, private SorS: SorService, private spinner: NgxSpinnerService) { }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  list = ['id', 'sor_item_category', 'region_cd', 'circle_cd', 'action'];
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
  }

  refresh(){
    this.header={}
    this.Add_row=[]
  }
  add_row() {
    this.Add_row.push({ item_code: '', item_work: '', desc: '', pwd_spec: '', unit: '', rate: '' })
  }
  async submit() {
    this.spinner.show();
    let obj = {}
    obj = this.header;
    obj['data'] = JSON.stringify(this.Add_row)
    obj['create_user_id'] = this.erpUser.user_id
    obj['b_acct_id'] = this.b_acct_id
    var resp = await this.SorS.createListOfItems(obj)
    if (resp['error'] == false) {
      await this.getItemList()
      this.spinner.hide()
      swal.fire('Successfully Submitted', '', 'success')
    }
    else {
      this.spinner.hide()
      swal.fire("Error", "...Error while creating item list",'error');

    }
  }
  itemList = []
  async getItemList() {
    this.spinner.show()
    var resp = await this.SorS.getListOfItems(this.b_acct_id)
    if (resp['error'] == false) {
      this.spinner.hide()
      this.itemList = resp['data']
      this.datasource = new MatTableDataSource(this.itemList);
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

  async delete_item(e) {
    this.spinner.show()
    let obj = {}
    obj['b_acct_id'] = this.b_acct_id
    obj['id'] = [e['id']]
    var resp = await this.SorS.deleteListOfItems(JSON.stringify(obj))
    if (resp['error'] == false) {
      await this.getItemList()
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
    this.Add_row = JSON.parse(e['data']);
    $('.nav-tabs a[href="#tab-3"]').tab('show');
  }
async update(){
    this.spinner.show()
    let obj = {}
    obj=this.header
    obj['b_acct_id'] = this.b_acct_id
    obj['data']=JSON.stringify(this.Add_row)
    obj['update_user_id']=this.erpUser.user_id
    var resp = await this.SorS.UpdateListOfItems(obj)
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
    var txt = 'ITEM LIST';
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
        if(j==0){
          objRow.columns.push({
            width: '*',
            text: i+1,
            alignment: 'left'
          })
        }
       else{
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



  
    pdfMake.createPdf(dd).download('itemCategoryList.pdf');

  }


}
