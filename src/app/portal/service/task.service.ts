import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/portal';
  }
  approvalObj={};
  async  getEmployeeMasterData(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl+'/hr/emp_info/empInfo/getAllEmployee' + JSON.stringify(obj)).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getArrayAllCurrentEstablishementInfo(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/establishment/getArrayAllCurrentEstablishementInfo'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getAllBill(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/hr/payroll_info/bill/getAllBills'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  
  async changeStatus(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/approval/updateapprovalstatus',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async changeStatusOfBill(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/hr/payroll_info/bill/changeStatusOfBill',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createContingentBill(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/accounts/contingentBill/createContingentBill',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


//Account
  async changeCbStatus(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/account/genericCb/changeCbStatus',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }

  async  UpdateStatusContra(obj){
    const resp = this.http.put<any>(this.main.httpUrl + '/account/contra/updatestatuscontra',obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

  
 async updateStatus(obj){
  const res = await this.http.put<any>(this.main.httpUrl + '/accounts/bp/updateStatus',obj).toPromise().then(res => {
    return res;
  });
  return res;
}

async updateUnpostedJournalStatus(obj){
  const res = await this.http.put<any>(this.main.httpUrl + '/account/journal/updateUnpostedJournalStatus',obj).toPromise().then(res => {
    return res;
  });
  return res;
}
}