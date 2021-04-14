import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import {DashboardService} from '../service/dashboard.service';
import { from } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-eng-dash',
  templateUrl: './eng-dash.component.html',
  styleUrls: ['./eng-dash.component.css']
})
export class EngDashComponent implements OnInit {

  constructor(private dashboardService: DashboardService, private snackBar: MatSnackBar, private router: Router, private spinner: NgxSpinnerService) { }
  erpUser;
  b_acct_id;

 

  async ngOnInit() {
    this.erpUser = JSON.parse(localStorage.getItem('erpUser'));
    this.b_acct_id = this.erpUser.b_acct_id;
   
  }





}
