import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
import { stringify } from 'querystring';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  httpUrl;


  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl+"/accounts/dashboard";
  }

  async  getDashBoardCount(b_acct_id) {
    const resp = await this.http.get<any>(this.httpUrl+'/dashboardcount' +b_acct_id).toPromise().then(res => {

      return res;
    });
    return resp;

  }
  async getTbl(fin_year){
    const resp = await this.http.get<any>(this.httpUrl+'/getTbl' +fin_year).toPromise().then(res => {

      return res;
    });
    return resp;
  }

  async getamountwithcoa(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl+'/getamountwithcoa' +b_acct_id).toPromise().then(res => {

      return res;
    });
    return resp;
  }

  async getamountwithevent(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl+'/getamountwithevent' +b_acct_id).toPromise().then(res => {

      return res;
    });
    return resp;
  }


  async getamountwithprocessingdate(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl+'/getamountwithprocessingdate' +b_acct_id).toPromise().then(res => {

      return res;
    });
    return resp;
  }
}
