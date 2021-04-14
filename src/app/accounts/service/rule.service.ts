import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';

@Injectable({
  providedIn: 'root'
})
export class RuleService {


  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + "/accounts/rule";
  }
  async  getHeadInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/accounts/settings/accountInfo/getAccountInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  getchartofaccount(obj){
    const resp = this.http.get<any>(this.main.httpUrl + '/accounts/chartofaccount/getchartofaccount'+obj).toPromise().then(res => {
      return res
    });
    return resp
  }

  async  getAccountInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/accounts/settings/accountInfo/getchartofAccount' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //rule
  async  getAllRules(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/getAllRule' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  deleteRule(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/deleteRule' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  createRule(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createRule', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  updateRule(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateRule', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async  applyRule(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/applyRule', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
