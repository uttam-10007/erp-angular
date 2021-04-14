import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class ChallanService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/settings";
  }
//get Account Type
  async  getAccountInfo(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/bankAccount/getBankAccounts' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //
  async  getPartyInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/account/ip/getIp' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async applyRule(obj){
    const res = await this.http.post<any>(this.main.httpUrl + '/accounts/rule/applyRule',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getDummyChallan(obj){
    const res = await this.http.get<any>(this.main.httpUrl + '/accounts/challan/getDummyChallan'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async getChallanInfo(obj){
    const res = await this.http.get<any>(this.main.httpUrl+'/accounts/challan/getChallanInfo'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async createChallan(obj){
    const res = await this.http.post<any>(this.main.httpUrl + '/accounts/challan/createChallan',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async updateChallan(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/accounts/challan/updateChallan',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async deleteChallan(obj){
    const res = await this.http.delete<any>(this.main.httpUrl +'/accounts/challan/deleteChallan'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async payChallanAmount(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/accounts/challan/payChallanAmount',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async updateChallanStatus(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/accounts/challan/updateChallanStatus',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async insertProcessedChallanData(obj){
    const res = await this.http.post<any>(this.main.httpUrl + '/accounts/challan/insertProcessedChallanData',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  
}
