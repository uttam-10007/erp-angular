import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root'
})
export class ApprService {

  httpUrl;

  employee_id;

  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl;
  }
  async getAllApproval(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/approval/getapproval' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteRule(obj) {
    const resp = await this.http.delete<any>(this.main.httpUrl + '/approval/deleteapproval' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  // async deleteApprovel(obj) {
  //   const resp = await this.http.delete<any>(this.main.httpUrl + '/approval/deleteapproval' + JSON.stringify(obj)).toPromise().then(res => {
  //     return res;
  //   });
  //   return resp;
  // }
  async createRule(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/approval/addApproval' , obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateRule(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl + '/approval/updateapproval' , obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async updateApprovalData(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl + '/approval/updateapprovalData' , obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllApprovalStatus(b_acct_id) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/approval/getdataofapprovalstatus' + b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}