import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class SorService {
  httpUrl;

  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl = this.main.httpUrl + '/eng/soritem';
    
   }

   async createsorestimate(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/eng/sorestimate/createsorestimate',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async getsorestimate(b_acct_id){
    const resp = await this.http.get<any>(this.main.httpUrl + '/eng/sorestimate/getsorestimate'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deletesorestimate(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl + '/eng/sorestimate/deletesorestimate'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updatesorestimate(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/eng/sorestimate/updatesorestimate',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
   async createListOfItems(obj){
    const resp = await this.http.post<any>(this.httpUrl + '/createsoritem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getListOfItems(b_acct_id){
    const resp = await this.http.get<any>(this.httpUrl + '/getsoritem'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async UpdateListOfItems(obj){
    const resp = await this.http.put<any>(this.httpUrl + '/updatesoritem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteListOfItems(obj){
    const resp = await this.http.delete<any>(this.httpUrl + '/deletesoritem'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createSorSelected(obj){
    const resp = await this.http.post<any>(this.main.httpUrl + '/eng/selectionitem/createitemselection',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getSorSelectedList(b_acct_id){
    const resp = await this.http.get<any>(this.main.httpUrl+ '/eng/selectionitem/getselectionitem'+b_acct_id).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async deleteSorSelectedList(obj){
    const resp = await this.http.delete<any>(this.main.httpUrl+ '/eng/selectionitem/deleteselectionitem'+obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateSorSelectedList(obj){
    const resp = await this.http.put<any>(this.main.httpUrl + '/eng/selectionitem/updateselectionitem',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}

// /eng/selectionitem/updateselectionitem