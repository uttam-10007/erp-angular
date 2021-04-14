import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/portal';
  }
  async getItReport(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/bill/getItReport' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  approvalObj={};
  async getEstablishementInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/establishment/getEstablishementInfo'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getSalarySlip(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/bill/getPaySlip'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getPersonalInfo(obj){
    const resp = await this.http.get<any>(this.main.httpUrl+'/hr/emp_info/empInfo/getPersonalInfo' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}