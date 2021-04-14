import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';

import swal from 'sweetalert2';

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
declare var $: any
@Component({
  selector: 'app-boq',
  templateUrl: './boq.component.html',
  styleUrls: ['./boq.component.css']
})
export class BoqComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor( private router: Router, private spinner: NgxSpinnerService,private snackBar: MatSnackBar) { }
  list = ['id', 'boq_desc', 'action'];
  datasource;
  embData={ data:[]}
  ngOnInit() {
  }
  applyFilter(filterValue: string) {
    this.datasource.filter = filterValue.trim().toLowerCase();
  }
refresh(){

}
  add(){
    this.embData.data.push({description:'',unit:'', quantity:'', inFigure:'',inWords:'',total:'',remark:''})
  } 
  delete(i) {
    this.embData['data'].splice(i, 1);
    this.changeTotal()
  }
async changeTotal(){
  for(let i=0;i<this.embData['data'].length;i++){
    let quantity=this.embData['data'][i]['quantity']
    let rate_in_figure=this.embData['data'][i]['rate_in_figure']
    let total=quantity*rate_in_figure
    this.embData['data'][i]['total']=total
  }
 let sum=0
  for(let j=0;j<this.embData['data'].length;j++){
   sum=sum+this.embData['data'][j]['total']
  }
  this.embData['sum']=sum.toFixed(2)
}
  async open_update(e) {
   
    $('.nav-tabs a[href="#tab-3"]').tab('show')
  }
  submit(){

  }
  update(){

  }
}
