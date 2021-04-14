import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class ContraService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"";
  }
  async  getcontra(obj){
    const resp = this.http.get<any>(this.httpUrl + '/account/contra/getcontra' + obj).toPromise().then(res => {
      return res
    });
    return resp
  }
  async  addcontra(obj){
    const resp = this.http.post<any>(this.httpUrl + '/account/contra/addcontra' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

  async  insertProcessedVoucherData(obj){
    const resp = this.http.post<any>(this.httpUrl + '/account/contra/insertProcessedVoucherData' ,obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }
  async  deletecontra(obj){
    const resp = this.http.delete<any>(this.httpUrl + '/account/contra/deletecontra' +obj).toPromise().then(res => {
      console.log(res)
      return res
    });
    return resp
  }

 
  async  updatecontra(obj) {
    const resp = await this.http.put<any>(this.httpUrl+'/account/contra/updatecontra',obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
