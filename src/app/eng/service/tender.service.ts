import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root'
})
export class TenderService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/tender';
  }
  
  
  
  async getSystemDate() {
    const res = await this.http.get<any>(this.main.httpUrl + '/metadata/sysAttribute/getSystemDate').toPromise().then(res => {
      return res;
    });
    return res;
  }
  //tender Result

  async gettenderResult(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/importedTenders/gettenderResult' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  //tender Mechanism
  async createtendermechanism(obj) {
    const resp = await this.http.post<any>(this.main.httpUrl + '/eng/tendermechanism/createtendermechanism', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async gettendermechanism(obj) {
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/tendermechanism/gettendermechanism' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }


  async updatetendermechanism(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl + '/eng/tendermechanism/updatetendermechanism', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatetendermechanismstatus(obj) {
    const resp = await this.http.put<any>(this.main.httpUrl + '/eng/tendermechanism/updatetendermechanismstatus', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deletetendermechanism(obj) {
    const resp = await this.http.delete<any>(this.main.httpUrl + '/eng/tendermechanism/deletetendermechanism' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createtender(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/createtender',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async gettenders(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/gettenders'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatetender(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatetender',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createimportedTender(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/eng/importedTenders/createimportedTender',obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
    async getimportedTenderss(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/importedTenders/getimportedTenderss'+obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
    async getTenderApplications(obj){
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/tenderApplication/getTenderApplications'+obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
    async updateimportedTenders(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/eng/importedTenders/updateimportedTenders',obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
    async updatetenderStatus(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatetenderStatus',obj).toPromise().then(res => {
    return res;
    });
    return resp;
    }
  async deletetender(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deletetender'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

}
