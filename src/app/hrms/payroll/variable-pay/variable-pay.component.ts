import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { PayrollService } from '../../service/payroll.service';
import { MainService } from '../../service/main.service';
declare var $: any
@Component({
  selector: 'app-variable-pay',
  templateUrl: './variable-pay.component.html',
  styleUrls: ['./variable-pay.component.css']
})
export class VariablePayComponent implements OnInit {



  constructor() { }
  

   ngOnInit() {

   

  }


  

}
