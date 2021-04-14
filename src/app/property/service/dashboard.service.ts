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
    this.httpUrl = this.main.httpUrl+"/property/dashboard";
  }

  async  getDashBoardCount(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getAllCount' +JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  getSubSchemeInYears(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getSubSchemeInYears' +JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  getAllotmentInYears(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getAllotmentInYears' +JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
