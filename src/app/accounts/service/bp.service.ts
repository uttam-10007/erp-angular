import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class BpService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) { 
    this.httpUrl = this.main.httpUrl+"/accounts/bp";
  }


  async  getPopUpData(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getdataforbp' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async  getList(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getAllBp' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async create(obj){
    const res = await this.http.post<any>(this.httpUrl + '/createBp',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async delete(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deleteBp'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async  getbpData(obj) {
    const resp = await this.http.get<any>(this.httpUrl+'/getbpdata' + obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }

  async deleteAdvice(obj){
    const res = await this.http.delete<any>(this.httpUrl + '/deleteAdvice'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
 async insertProcessedbp(obj){
    const res = await this.http.post<any>(this.httpUrl + '/insertProcessedbp',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async createAdvice(obj){
    const res = await this.http.post<any>(this.httpUrl + '/createAdvice',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
  async getAdvice(obj){
    const res = await this.http.get<any>(this.httpUrl + '/getAdvice'+obj).toPromise().then(res => {
      return res;
    });
    return res;
  }




 async updateStatus(obj){
    const res = await this.http.put<any>(this.main.httpUrl + '/accounts/bp/updateStatus',obj).toPromise().then(res => {
      return res;
    });
    return res;
  }
}
