import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class BillService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/account/genericCb";
  }
  //gst
  async  getworkInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/work/getworkInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
   async  getgst(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/account/setting/gst/getgst' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async acceptCb(obj){
    const res = await this.http.put<any>(this.httpUrl + '/acceptCb',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
//party
  async  getPartyInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/account/ip/getIp' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  //get Account Type
  async  getAccountInfo(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/accounts/settings/accountInfo/getAccountInfo' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
//cb-bill
async getAllContingentBills(obj){
    const res = await this.http.get<any>(this.httpUrl + '/getgenericcb'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
 
  async updateGenericCb(obj){
    const res = await this.http.put<any>(this.httpUrl + '/updateGenericCb',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async changeCbStatus(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/account/genericCb/changeCbStatus',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async insertProcessedCBData(obj){
    const res = await this.http.post<any>(this.httpUrl + '/insertProcessedCBData',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async addgenericcb(obj){
    const res = await this.http.post<any>(this.httpUrl + '/addgenericcb',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async deleteContingentBill(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deletegenericcb'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }


  async getSystemDate(){
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/sysAttribute/getSystemDate').toPromise().then(res => {
      return res;
    });
    return res;
  }





  /////////////////////////////////Approvel

  async getAllApproval(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/approval/getapproval' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async sendToApproval(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/approval/addapprovalstatus', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getDocumentStatus(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/approval/getdataofapprovalstatus' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
