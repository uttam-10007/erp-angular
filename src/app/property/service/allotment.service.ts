import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import {MainService} from './main.service';
@Injectable({
  providedIn: 'root'
})
export class AllotmentService {

  httpUrl;
  constructor(private http: HttpClient, private main: MainService) {
    this.httpUrl =  this.main.httpUrl+ "/property/allotment";
  }
  async getAllAllotment(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getAllAllotment' + obj).toPromise().then(res => {
     
      return res
    });
    return resp
  }
  async approveAllotment(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/approveAllotment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async createAllotment(obj) {
    const resp = await this.http.post<any>(this.httpUrl + '/createAllotment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async updateAllotment(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/updateAllotment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
  async getDataForAllotment(obj) {
    const resp = this.http.get<any>(this.httpUrl + '/getDataForAllotment' + obj).toPromise().then(res => {
     
      return res
    });
    return resp
  }
  async cancelAllotment(obj) {
    const resp = await this.http.put<any>(this.httpUrl + '/cancelAllotment', obj).toPromise().then(res => {
      return res;
    });
    return resp;
  }
}
