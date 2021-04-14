import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class ProjectBankAccService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl;
  }


  async  delete(obj) {
    const resp = await this.http.delete<any>(this.httpUrl + '/accounts/projectBank/deleteProjectBankAccounts' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  create(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/accounts/projectBank/createProjectBankAccounts', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
 async  getProjectBank(obj) {
    const resp = await this.http.get<any>(this.httpUrl + '/accounts/projectBank/getProjectBankAccounts' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async  update(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/accounts/projectBank/updateProjectBankAccounts', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


}
